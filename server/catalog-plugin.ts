import type { Plugin, Connect } from 'vite';
import { handleCatalogRequest } from './catalog-download.ts';
const middleware: Connect.NextHandleFunction = async (req, res, next) => {
  try {
    const response = await handleCatalogRequest(req.url ?? '/', req.method);
    if (!response) {
      next();
      return;
    }
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.statusCode = 500;
    res.end('Falha ao baixar partitura.');
  }
};
export function catalogDownloads(): Plugin {
  return {
    name: 'catalog-downloads',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
