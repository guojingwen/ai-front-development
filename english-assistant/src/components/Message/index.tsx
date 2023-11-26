import chatService from '@/utils/chatService';
import { Markdown } from '../Markdown';
import { useEffect, useState, KeyboardEvent } from 'react';
import {
  ActionIcon,
  Textarea,
  Loader,
  useMantineColorScheme,
} from '@mantine/core';
import * as messageStore from '@/dbs/messageStore';
import {
  IconSend,
  IconSendOff,
  IconEraser,
} from '@tabler/icons-react';
import { API_KEY, USERMAP } from '@/utils/constant';
import events from '@/utils/event';

import {
  Assistant,
  Message,
  MessageList,
  SendMessage,
  Session,
} from '@/types';
import clsx from 'clsx';

type Props = {
  session: Session;
  assistant: Assistant;
};
const MessageComp = ({ session, assistant }: Props) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessageList] = useState<MessageList>([]);

  const { colorScheme } = useMantineColorScheme();

  chatService.actions = {
    onCompleting: (sug) => setSuggestion(sug),
    onCompleted: () => {
      console.log('onCompleted');
      setLoading(false);
    },
  };

  useEffect(() => {
    (async () => {
      const msgs = await messageStore.getMessages(session.id);
      setMessageList(msgs);
      if (loading) {
        chatService.cancel();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const onClear = () => {
    console.log('todo onClear');
  };
  const onKeyDown = (evt: KeyboardEvent<HTMLTextAreaElement>) => {
    if (evt.keyCode === 13 && !evt.shiftKey) {
      evt.preventDefault();
      onSubmit();
    }
  };

  const setSuggestion = (suggestion: string) => {
    if (suggestion === '') return;
    const len = messages.length;
    const lastMsg = messages[len - 1];
    let newList: MessageList = [];
    if (lastMsg?.role === 'assistant') {
      lastMsg.content = suggestion;
      newList = [...messages.slice(0, len - 1), lastMsg];
      messageStore.updateMessage(lastMsg);
    } else {
      const newMsg: Message = {
        id: `${Date.now()}`,
        sessionId: session.id,
        role: 'assistant',
        content: suggestion,
      };
      messageStore.addMessage(newMsg);
      newList = [...messages, newMsg];
    }
    setMessageList(newList);
  };

  const onSubmit = async () => {
    if (!localStorage[API_KEY]) {
      debugger;
      await new Promise((resolve) => {
        events.emit('needToken', resolve);
      });
    }
    if (loading) {
      chatService.cancel();
      return;
    }
    if (!prompt.trim()) return;
    if (!messages.length) {
      // 最多只能有一个空会话
      localStorage.emptySessionId = '';
    }
    const lastMsg: Message = {
      id: `${Date.now()}`,
      role: 'user',
      content: prompt,
      sessionId: session.id,
    };
    messageStore.addMessage(lastMsg);
    let list: MessageList = [...messages, lastMsg];
    setMessageList(list);
    setLoading(true);
    chatService.getStream({
      prompt,
      history: list.slice(-assistant!.max_log).map((it) => {
        const newIt: any = {
          ...it,
        };
        delete newIt.id;
        delete newIt.sessionId;
        return newIt as SendMessage;
      }),
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
        {messages.map((item, idx) => {
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
                {!isUser &&
                  idx === messages.length - 1 &&
                  loading && (
                    <Loader
                      size='sm'
                      variant='dots'
                      className='ml-2'
                    />
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
export default MessageComp;
