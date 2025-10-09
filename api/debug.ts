import type { VercelRequest, VercelResponse } from '@vercel/node';

function buildApiUrl(req: VercelRequest): string {
  const { path } = req.query;
  const pathSegments = Array.isArray(path) ? path.join('/') : path ?? '';
  const queryString = new URL(req.url ?? '', `https://${req.headers.host}`).search;
  return `https://api.foodics.dev/v5/${pathSegments}${queryString}`;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const apiUrl = buildApiUrl(req);
  
  return res.status(200).json({
    message: 'Debug info',
    constructedUrl: apiUrl,
    query: req.query,
    url: req.url,
    path: req.query.path,
    headers: {
      host: req.headers.host
    }
  });
}

