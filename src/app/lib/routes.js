import fs from 'fs';
import path from 'path';

const appDirectory = path.join(process.cwd(), 'src', 'app');

function isDirectory(path) {
  return fs.lstatSync(path).isDirectory();
}

function isValidRoute(route) {
  // Exclude routes that start with underscore, api, or are system files
  return !route.startsWith('_') && !route.startsWith('api') && route !== 'layout.js' && route !== 'page.js';
}

function getRoutesFromDirectory(dir, basePath = '') {
  const entries = fs.readdirSync(dir);
  
  let routes = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const relativePath = path.join(basePath, entry);

    if (isDirectory(fullPath)) {
      if (isValidRoute(entry)) {
        if (entry === '[name]') {
          // Handle dynamic routes
          routes.push(path.join(basePath, ':name'));
        } else {
          routes.push(relativePath);
        }
        routes = routes.concat(getRoutesFromDirectory(fullPath, relativePath));
      }
    } else if (entry === 'page.js' || entry === 'page.jsx') {
      // Add the directory as a route if it contains a page file
      routes.push(basePath);
    }
  }

  return routes;
}

export async function getAllRoutes() {
  const routes = getRoutesFromDirectory(appDirectory);
  
  // Add the root route
  routes.unshift('/');

  // Remove duplicates and sort
  const uniqueRoutes = [...new Set(routes)].sort();

  return uniqueRoutes.map(route => route.replace(/\\/g, '/'));
}