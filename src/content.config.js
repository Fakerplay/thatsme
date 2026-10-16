import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: z.object({
    id: z.string(), title: z.string().min(1), type: z.string(),
    category: z.string(), year: z.string(), role: z.string(),
    summary: z.string().min(1), order: z.number().int(),
    assets: z.array(z.string()).min(1), captions: z.array(z.string()),
  }).passthrough().refine(p => p.assets.length === p.captions.length, {
    message: 'Every project visual needs a matching caption.',
  }),
});
export const collections = { projects };
