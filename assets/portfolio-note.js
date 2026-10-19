(()=>{
  const note=document.getElementById('portfolio-note');
  if(!note)return;
  const key='portfolio-note-dismissed';
  try{if(localStorage.getItem(key)==='1'){note.remove();return}}catch(e){}
  const dismiss=()=>{
    try{localStorage.setItem(key,'1')}catch(e){}
    note.remove();
  };
  note.open=!matchMedia('(max-width:600px)').matches;
  note.querySelector('.postcard-dismiss').addEventListener('click',event=>{event.preventDefault();event.stopPropagation();dismiss()});
  note.querySelector('summary').addEventListener('click',event=>{
    if(note.open){event.preventDefault();dismiss()}
  });
})();
