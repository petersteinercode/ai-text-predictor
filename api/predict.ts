import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt: text,
        max_tokens: 1,
        temperature: 0.7,
        logprobs: 5,
        echo: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const logprobs = data.choices?.[0]?.logprobs;

    if (logprobs && logprobs.top_logprobs && logprobs.top_logprobs[0]) {
      const topLogprobs = logprobs.top_logprobs[0];

      const predictions = Object.entries(topLogprobs)
        .map(([token, logprob]) => ({
          word: token.trim(),
          probability: Math.exp(logprob as number),
        }))
        .filter((pred) => pred.word.length > 0)
        .slice(0, 5);

      return res.status(200).json({ predictions });
    }

    return res.status(200).json({ predictions: [] });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
