import { getCollection } from 'astro:content';
export const PROJECTS = (await getCollection('projects'))
  .map(entry => ({ ...entry.data, id: entry.id }))
  .sort((a, b) => a.order - b.order);
