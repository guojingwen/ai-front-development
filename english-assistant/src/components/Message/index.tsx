import chatService from '@/utils/chatService';
import { Markdown } from '../Markdown';
import { useEffect, useState, KeyboardEvent } from 'react';
import {
  ActionIcon,
  Textarea,
  Loader,
  useMantineColorScheme,
} from '@mantine/core';
import * as chatStorage from '@/utils/chatStorage';
import {
  IconSend,
  IconSendOff,
  IconEraser,
} from '@tabler/icons-react';
import { USERMAP } from '@/utils/constant';

import { Assistant, MessageList } from '@/types';
import clsx from 'clsx';

type Props = {
  sessionId: string;
  assistant: Assistant;
};
const Message = ({ sessionId, assistant }: Props) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageList>([]);
  const { colorScheme } = useMantineColorScheme();
  const updateMessage = (msg: MessageList) => {
    setMessage(msg);
    chatStorage.updateMessage(sessionId, msg);
  };

  chatService.actions = {
    onCompleting: (sug) => setSuggestion(sug),
    onCompleted: () => {
      console.log('onCompleted');
      setLoading(false);
    },
  };

  useEffect(() => {
    const msg = chatStorage.getMessage(sessionId);
    setMessage(msg);
    chatStorage.updateMessage(sessionId, msg);
    if (loading) {
      chatService.cancel();
    }
  }, [sessionId]);

  const onClear = () => {
    updateMessage([]);
  };
  const onKeyDown = (evt: KeyboardEvent<HTMLTextAreaElement>) => {
    if (evt.keyCode === 13 && !evt.shiftKey) {
      evt.preventDefault();
      onSubmit();
    }
  };

  const setSuggestion = (suggestion: string) => {
    if (suggestion === '') return;
    const len = message.length;
    const lastMsg = message[len - 1];
    let newList: MessageList = [];
    if (lastMsg?.role === 'assistant') {
      newList = [
        ...message.slice(0, len - 1),
        {
          ...lastMsg,
          content: suggestion,
        },
      ];
    } else {
      newList = [
        ...message,
        {
          role: 'assistant',
          content: suggestion,
        },
      ];
    }
    chatStorage.updateMessage(sessionId, newList);
    setMessage(newList);
  };
  /* const setChatLogs = (logs: MessageList) => {
    setMessages(logs);
    updateChatLogs(sessionId, logs);
  }; */
  const onSubmit = async () => {
    if (loading) {
      chatService.cancel();
      return;
    }
    if (!prompt.trim()) return;
    let list: MessageList = [
      ...message,
      {
        role: 'user',
        content: prompt,
      },
    ];
    setMessage(list);
    chatStorage.updateMessage(sessionId, list);
    setLoading(true);
    chatService.getStream({
      prompt,
      history: list.slice(-assistant!.max_log),
      options: assistant,
    });
    setPrompt('');
  };

  return (
    <>
      <div
        className={clsx([
          'flex-col',
          'h-[calc(100vh-10rem)]',
          'w-full',
          'overflow-y-auto',
          'rounded-sm',
          'px-8',
        ])}>
        {message.map((item, idx) => {
          const isUser = item.role === 'user';
          const isLight = colorScheme === 'light';
          return (
            <div
              key={`${item.role}-${idx}`}
              className={clsx(
                {
                  flex: isUser,
                  'flex-col': isUser,
                  'items-end': isUser,
                },
                'mt-4'
              )}>
              <div>
                {USERMAP[item.role]}
                {!isUser && idx === message.length - 1 && loading && (
                  <Loader size='sm' variant='dots' className='ml-2' />
                )}
              </div>
              <div
                className={clsx(
                  {
                    'bg-gray-100': isLight,
                    'bg-zinc-700/40': !isLight,
                    'whitespace-break-spaces': isUser,
                  },
                  'rounded-md',
                  'shadow-md',
                  'px-4',
                  'py-2',
                  'mt-1',
                  'w-full',
                  'max-w-4xl',
                  'min-h-[3rem]'
                )}>
                {isUser ? (
                  <div>{item.content}</div>
                ) : (
                  <Markdown markdownText={item.content}></Markdown>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div
        className={clsx(
          'flex',
          'items-center',
          'justify-center',
          'self-end',
          'my-4',
          'w-full'
        )}>
        <ActionIcon
          className='mr-2'
          disabled={loading}
          onClick={() => onClear()}>
          <IconEraser></IconEraser>
        </ActionIcon>
        <Textarea
          placeholder='Enter 发送消息；Shift + Enter 换行；'
          className='w-3/5'
          value={prompt}
          disabled={loading}
          onKeyDown={(evt) => onKeyDown(evt)}
          onChange={(evt) => setPrompt(evt.target.value)}></Textarea>
        <ActionIcon className='ml-2' onClick={() => onSubmit()}>
          {/* loading={loading} */}
          {loading ? <IconSendOff /> : <IconSend />}
          {/* <IconSend></IconSend> */}
        </ActionIcon>
      </div>
    </>
  );
};
export default Message;
