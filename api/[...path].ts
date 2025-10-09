/**
 * File: api/[...path].ts
 * Purpose: Vercel serverless function to proxy all /api/* requests to Foodics API
 * Notes: Catch-all route that forwards requests with original path and query params
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

function buildApiUrl(req: VercelRequest): string {
  const { path } = req.query;
  const pathSegments = Array.isArray(path) ? path.join('/') : path ?? '';
  const queryString = new URL(req.url ?? '', `https://${req.headers.host}`).search;
  return `https://api.foodics.dev/v5/${pathSegments}${queryString}`;
}

function getRequestBody(req: VercelRequest): string | undefined {
  return req.method !== 'GET' && req.method !== 'HEAD' 
    ? JSON.stringify(req.body) 
    : undefined;
}

function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.FOODICS_TOKEN;
  
  if (!token) {
    return res.status(500).json({ 
      error: 'FOODICS_TOKEN environment variable not configured' 
    });
  }

  const apiUrl = buildApiUrl(req);

  try {
    const response = await fetch(apiUrl, {
      method: req.method ?? 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: getRequestBody(req),
    });

    const data = await response.json();
    setCorsHeaders(res);

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to fetch from Foodics API',
      details: error instanceof Error ? error.message : 'Unknown error',
      requestedUrl: apiUrl
    });
  }
}

