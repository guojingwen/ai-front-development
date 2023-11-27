import OpenAI from 'openai';
import { Assistant, MessageList, Message } from '@/types';
import { API_KEY } from '@/utils/constant';
import { arrayBufferToBase64 } from '@/utils/utils';

export default async function voiceRequest({
  file,
  history,
  options,
}: {
  file: File;
  history: MessageList;
  options: Assistant;
}) {
  const client = new OpenAI({
    apiKey: localStorage[API_KEY],
    dangerouslyAllowBrowser: true,
  });

  //speech to text
  const transcription = await client.audio.transcriptions.create({
    file,
    model: 'whisper-1',
  });
  // text completion
  const completion = await client.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: options.prompt || 'you are a helpful assistant',
      },
      ...history.map((msg: Message) => {
        return {
          role: msg.role,
          content: msg.content,
        };
      }),
      {
        role: 'user',
        content: transcription.text,
      },
    ],
    model: 'gpt-3.5-turbo-1106',
  });
  // text to speech
  const audio = await client.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: completion.choices[0].message.content!,
  });
  const arrayBuffer = await audio.arrayBuffer();
  const audioUrl = await arrayBufferToBase64(arrayBuffer);

  return new Response(
    JSON.stringify({
      transcription: transcription.text,
      completion: completion.choices[0].message.content,
      audioUrl,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
