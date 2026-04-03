// api/postcode.js — Vercel serverless function
// Thin CORS proxy for the Electoral Commission / Democracy Club API
// No API key required for their public postcode endpoint.

export default async function handler(req, res) {
  // Allow GET or POST
  const postcode = (req.query.postcode || req.body?.postcode || '').replace(/\s/g, '').toUpperCase();

  if (!postcode) {
    return res.status(400).json({ error: 'No postcode provided' });
  }

  const url = `https://api.electoralcommission.org.uk/api/v1/postcode/${postcode}/?auth_token=`;

  try {
    const upstream = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Electoral Commission API error', status: upstream.status });
    }

    const data = await upstream.json();

    // Set permissive CORS so the browser frontend can call this directly
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate'); // cache 5 min
    return res.status(200).json(data);

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(502).json({ error: 'Failed to reach Electoral Commission API' });
  }
}
