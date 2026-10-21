import { useStoryblokApi } from '@storyblok/astro';
export async function getCaseStudy(id) {
  if (!import.meta.env.STORYBLOK_DELIVERY_API_TOKEN) return null;
  // Public routes always use published content; drafts live behind the signed editor route.
  const version='published';
  try {
    const { data }=await useStoryblokApi().get(`cdn/stories/project/${id}`,{version});
    if(data.story?.content?.component!=='case_study') throw new Error(`Invalid case-study component: ${id}`);
    return data.story;
  } catch(error) {
    if(error.status===404 || error.response?.status===404) return null;
    // Fail the build rather than silently publishing stale content on API/auth errors.
    throw new Error(`Storyblok could not load project/${id}. Check the token, region and service availability.`);
  }
}
