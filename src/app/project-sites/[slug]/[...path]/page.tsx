import { redirect } from 'next/navigation';

export default async function ProjectCatchAll({ params }: { params: Promise<{ slug: string, path: string[] }> }) {
  const { slug } = await params;
  
  // For now, redirect subpaths to the main project page
  redirect(`/project-sites/${slug}`);
}
