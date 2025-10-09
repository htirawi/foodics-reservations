/**
 * File: api/proxy.ts
 * Purpose: Vercel serverless function to proxy Foodics API requests and bypass CORS
 * Notes: Handles all HTTP methods and forwards requests to Foodics API
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.FOODICS_TOKEN;
  
  if (!token) {
    return res.status(500).json({ 
      error: 'FOODICS_TOKEN environment variable not configured' 
    });
  }

  const url = new URL(req.url ?? '', `https://${req.headers.host}`);
  const apiPath = url.pathname.replace(/^\/api/, '');
  const apiUrl = `https://api.foodics.dev/v5${apiPath}${url.search}`;

  try {
    const response = await fetch(apiUrl, {
      method: req.method ?? 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' 
        ? JSON.stringify(req.body) 
        : undefined,
    });

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to fetch from Foodics API',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

