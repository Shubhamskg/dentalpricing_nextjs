import { getAllRoutes } from './lib/routes';

export default async function sitemap() {
  const baseUrl = 'https://www.dentalpricing.co.uk';
  const routes = await getAllRoutes();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));
}