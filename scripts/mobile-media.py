#!/usr/bin/env python3
"""Generate phone-sized copies of portfolio media (desktop files are never touched).

  python3 scripts/mobile-media.py            # create anything missing
  python3 scripts/mobile-media.py --force    # rebuild everything

Needs ffmpeg + ImageMagick (`magick`). Writes:
  assets/mobile/<path>-<w>.webp      640/960/1280-wide stills (never upscaled), used through srcset
  assets/mobile/<path>.mp4           small H.264 loop for phones (no audio, faststart)
  assets/mobile/<path>-poster.webp   poster for videos that have none
  assets/mobile/<path>-frame.webp    still frame for big animated webps (shown before the mp4 swaps in)
  src/data/mobile-media.json         manifest read by src/lib/render.js at build time

Run it again after adding new artwork to src/data/portfolio.json.
"""
import json, os, subprocess, sys, shutil, tempfile
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
FORCE = '--force' in sys.argv
DATA = json.load(open('src/data/portfolio.json'))
A, DIM = DATA['A'], DATA['DIM']
WIDTHS = [640, 960, 1280]
VIDEO_MAX_BYTES = 1_500_000
ANIM_MIN_BYTES = 300_000  # animated webps above this get an mp4 on phones

def out_path(src, suffix):
    rel = src[len('assets/'):] if src.startswith('assets/') else src
    stem = os.path.splitext(rel)[0]
    return f'assets/mobile/{stem}{suffix}'

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(' '.join(cmd) + '\n' + r.stderr[-2000:])
    return r.stdout

def probe(path):
    out = run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
               'stream=width,height,r_frame_rate:format=duration', '-of', 'json', path])
    j = json.loads(out)
    s = j['streams'][0]
    num, den = s['r_frame_rate'].split('/')
    return s['width'], s['height'], float(j['format']['duration']), float(num) / float(den or 1)

def frames(path):
    try:
        return int(run(['magick', 'identify', '-format', '%n\n', path]).split()[0])
    except Exception:
        return 1

def need(path):
    return FORCE or not os.path.exists(path)

def encode_video(src, dst, w, h, duration, rate):
    # Fit inside 960x540 (landscape) / 540x960 (portrait) / 720x720 (square-ish); never upscale.
    if abs(w - h) / max(w, h) < 0.1:
        box = (720, 720)
    elif w > h:
        box = (960, 540)
    else:
        box = (576, 720)
    scale = min(1, box[0] / w, box[1] / h)
    def dims(sc):
        return max(2, int(w * sc) // 2 * 2), max(2, int(h * sc) // 2 * 2)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    tmp = dst + '.tmp.mp4'
    base = ['ffmpeg', '-y', '-v', 'error', '-i', src, '-an', '-c:v', 'libx264', '-preset', 'slow',
            '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart']
    fps = ',fps=fps=30' if rate > 31 else ''  # cap 60fps sources at 30, never add frames
    ow, oh = dims(scale)
    run(base + ['-vf', f'scale={ow}:{oh}:flags=lanczos{fps}', '-crf', '28', tmp])
    if os.path.getsize(tmp) > VIDEO_MAX_BYTES:
        # Too big at CRF 28: cap the bitrate to land near 1.4 MB; drop to 640 wide when that bitrate is thin.
        kbps = int(1_400_000 * 8 / duration / 1000)
        if kbps < 450:
            ow, oh = dims(min(scale, 640 / max(w, h) if w > h else 640 / h))
        run(base + ['-vf', f'scale={ow}:{oh}:flags=lanczos{fps}', '-crf', '28',
                    '-maxrate', f'{kbps}k', '-bufsize', f'{kbps * 2}k', tmp])
    os.replace(tmp, dst)
    return ow, oh

def still(src, dst, width, quality=75, frame0=False):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    s = src + '[0]' if frame0 else src
    run(['magick', s, '-auto-orient', '-strip', '-resize', f'{width}x>', '-quality', str(quality),
         '-define', 'webp:method=6', dst])

def anim_to_mp4(src, dst, w, h):
    # ffmpeg cannot decode animated webp, so coalesce frames with ImageMagick first.
    d = tempfile.mkdtemp()
    try:
        delays = run(['magick', 'identify', '-format', '%T\n', src]).split()
        delays = [max(int(x), 2) for x in delays]  # centiseconds
        run(['magick', src, '-coalesce', os.path.join(d, 'f%04d.png')])
        files = sorted(f for f in os.listdir(d) if f.endswith('.png'))
        with open(os.path.join(d, 'list.txt'), 'w') as fh:
            for f, t in zip(files, delays):
                fh.write(f"file '{os.path.join(d, f)}'\nduration {t / 100:.3f}\n")
            fh.write(f"file '{os.path.join(d, files[-1])}'\n")
        sc = min(1, 960 / w, 960 / h)
        ow, oh = max(2, int(w * sc) // 2 * 2), max(2, int(h * sc) // 2 * 2)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', os.path.join(d, 'list.txt'),
             '-vf', f'scale={ow}:{oh}:flags=lanczos,fps=fps=30,format=yuv420p', '-an', '-c:v', 'libx264',
             '-preset', 'slow', '-crf', '28', '-movflags', '+faststart', dst])
    finally:
        shutil.rmtree(d, ignore_errors=True)

def has_desktop_poster(key, src):
    # Mirrors the poster rule in src/lib/render.js picture().
    if key.startswith('bhabha-motion-') or key.startswith('original-') or src.startswith('assets/optimized/'):
        return os.path.exists(src[:-4] + '.jpg')
    return False

manifest = {'images': {}, 'videos': {}, 'anim': {}}
jobs = []

for key, src in A.items():
    if not os.path.exists(src):
        continue
    if src.endswith('.mp4'):
        dst = out_path(src, '.mp4')
        entry = {'src': dst}
        if not has_desktop_poster(key, src):
            entry['poster'] = out_path(src, '-poster.webp')
        manifest['videos'][key] = entry
        def vjob(src=src, dst=dst, entry=entry):
            w, h, dur, rate = probe(src)
            if need(dst):
                encode_video(src, dst, w, h, dur, rate)
            if 'poster' in entry and need(entry['poster']):
                os.makedirs(os.path.dirname(entry['poster']), exist_ok=True)
                png = entry['poster'] + '.png'
                run(['ffmpeg', '-y', '-v', 'error', '-ss', '0', '-i', src, '-frames:v', '1', '-update', '1', png])
                still(png, entry['poster'], 960, 72)
                os.remove(png)
        jobs.append(('v', vjob))
        continue
    if not src.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif')) or key not in DIM:
        continue
    native = DIM[key][0]
    n = frames(src)
    if n > 1:
        if os.path.getsize(src) >= ANIM_MIN_BYTES:
            frame = out_path(src, '-frame.webp')
            mp4 = out_path(src, '.mp4')
            manifest['anim'][key] = {'src': mp4, 'frame': frame, 'frameWidth': min(960, native)}
            def ajob(src=src, frame=frame, mp4=mp4, native=native, key=key):
                if need(frame):
                    still(src, frame, min(960, native), 72, frame0=True)
                if need(mp4):
                    anim_to_mp4(src, mp4, DIM[key][0], DIM[key][1])
            jobs.append(('a', ajob))
        continue  # small animations stay as they are
    widths = [w for w in WIDTHS if w < native * 0.9]
    if not widths:
        continue
    manifest['images'][key] = [[out_path(src, f'-{w}.webp'), w] for w in widths]
    def ijob(src=src, widths=widths):
        for w in widths:
            dst = out_path(src, f'-{w}.webp')
            if need(dst):
                still(src, dst, w)
    jobs.append(('i', ijob))

errors = []
def safe(job):
    try:
        job[1]()
    except Exception as e:
        errors.append(str(e))
with ThreadPoolExecutor(max_workers=int(os.environ.get('JOBS', '2'))) as ex:
    list(ex.map(safe, jobs))

# Drop entries whose files failed to build so the site never points at a missing file.
for key in list(manifest['images']):
    # Keep only copies that exist and are actually lighter than the original.
    manifest['images'][key] = [c for c in manifest['images'][key] if os.path.exists(c[0]) and os.path.getsize(c[0]) < os.path.getsize(A[key])]
    if not manifest['images'][key]:
        del manifest['images'][key]
for key, e in list(manifest['videos'].items()):
    if not os.path.exists(e['src']):
        del manifest['videos'][key]
    elif 'poster' in e and not os.path.exists(e['poster']):
        del e['poster']
for key, e in list(manifest['anim'].items()):
    if not (os.path.exists(e['src']) and os.path.exists(e['frame'])):
        del manifest['anim'][key]

json.dump(manifest, open('src/data/mobile-media.json', 'w'), indent=1, sort_keys=True)
print(f"images {len(manifest['images'])}, videos {len(manifest['videos'])}, animations {len(manifest['anim'])}, errors {len(errors)}")
for e in errors:
    print('ERROR', e[:600])
