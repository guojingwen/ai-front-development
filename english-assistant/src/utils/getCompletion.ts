import { SendMessage } from '@/types';
type Props = {
  prompt: string;
  history?: SendMessage[];
  options?: {
    temperature?: number;
    max_tokens?: number;
  };
};

export const getCompletion = async (params: Props) => {
  // handler
  const url = 'https://api.openai.com/v1/chat/completions';
  // /api/chat
  const resp = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'you are ai assitant',
        },
        ...params.history!,
        {
          role: 'user',
          content: params.prompt,
        },
      ],
    }),
    ...params.options,
  });

  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
  return await resp.json();
};
