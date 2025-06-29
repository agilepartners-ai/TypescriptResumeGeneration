import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const responseData = {
    status: 'healthy',
    message: 'GenApply API is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/extract-resume-json',
      '/api/generate-cover-letter',
      '/api/optimize-resume',
      '/api/ai-enhance',
      '/api/templates'
    ]
  };

  res.status(200).json(responseData);
}