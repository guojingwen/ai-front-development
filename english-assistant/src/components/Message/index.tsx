import chatService from '@/utils/chatService';
import { Markdown } from '../Markdown';
import {
  useEffect,
  useState,
  KeyboardEvent,
  useRef,
  useContext,
} from 'react';
import {
  ActionIcon,
  Input,
  useMantineColorScheme,
} from '@mantine/core';
import * as messageStore from '@/dbs/messageStore';
import {
  IconSend,
  IconSendOff,
  IconRobot,
  IconUser,
} from '@tabler/icons-react';
import { API_KEY, USERMAP } from '@/utils/constant';
import events from '@/utils/event';
import './message.css';
import { IconKeyboard, IconMicrophone } from '@tabler/icons-react';
import {
  Assistant,
  Message,
  MessageList,
  SendMessage,
  Session,
} from '@/types';
import clsx from 'clsx';
import { Voice } from '../Voice';

type Props = {
  session: Session;
  assistant: Assistant;
};
const MessageComp = ({ session, assistant }: Props) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessageList] = useState<MessageList>([]);
  const scrollRef = useRef<HTMLDivElement>();
  const [mode, setMode] = useState('text');
  const { colorScheme } = useMantineColorScheme();

  chatService.actions = {
    onCompleting: (sug) => setSuggestion(sug),
    onCompleted: () => {
      // console.log('onCompleted');
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

  const onKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
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
    scrollRef.current!.scrollTop += 200;
    setMessageList(newList);
  };

  const onSubmit = async () => {
    if (!localStorage[API_KEY]) {
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
    setLoading(true);
    setMessageList(list);
    // requestIdleCallback safari不兼容
    setTimeout(() => {
      scrollRef.current!.scrollTop += 200;
    }, 20);
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
  const isLight = colorScheme === 'light';

  return (
    <>
      <div
        className={clsx([
          'flex-col',
          'h-[calc(100vh-10rem)]',
          'w-full',
          'max-w-2xl',
          'overflow-y-auto',
          'rounded-sm',
          'px-8',
        ])}
        ref={(_ref) => (scrollRef.current = _ref!)}>
        {messages.map((item, idx) => {
          const isUser = item.role === 'user';
          return (
            <div key={`${item.role}-${idx}`} className={clsx('mt-4')}>
              <div className={clsx('flex', 'flex-row', 'mb-10')}>
                <div
                  className={clsx(
                    {
                      'bg-violet-600': !isUser,
                      'bg-sky-500': isUser,
                    },
                    'flex-none',
                    'mr-4',
                    'rounded-full',
                    'h-8',
                    'w-8',
                    'flex',
                    'justify-center',
                    'items-center'
                  )}>
                  {isUser ? (
                    <IconUser color='white' size={24} />
                  ) : (
                    <IconRobot color='white' size={24} />
                  )}
                </div>
                <div className='flex flex-col'>
                  <div className='text-lg font-medium'>
                    {USERMAP[item.role]}
                  </div>
                  <div
                    className={clsx(
                      {
                        'whitespace-break-spaces': isUser,
                      },
                      'w-full',
                      'max-w-4xl',
                      'min-h-[1rem]'
                    )}>
                    {isUser ? (
                      <div>{item.content}</div>
                    ) : (
                      <Markdown
                        markdownText={
                          item.content +
                          (idx === messages.length - 1 && loading
                            ? `<span style='display: inline-block;width:0.8rem;height:0.8rem;border-radius:50%;background-color:#333;margin-left:0.1rem'><span>`
                            : '')
                        }></Markdown>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className={clsx(
          'flex',
          'items-center',
          'my-4',
          'w-full',
          'max-w-xl'
        )}>
        <ActionIcon
          onClick={() => setMode(mode === 'text' ? 'audio' : 'text')}>
          {mode !== 'text' ? (
            <IconKeyboard
              size={30}
              color={isLight ? '#333' : '#ccc'}
            />
          ) : (
            <IconMicrophone
              size={30}
              color={isLight ? '#333' : '#ccc'}
            />
          )}
        </ActionIcon>

        <div className='ml-2 w-full flex items-center rounded-2xl border-solid border border-slate-300 overflow-hidden'>
          {mode === 'text' ? (
            <>
              <Input
                placeholder='Enter 发送消息；Shift + Enter 换行；'
                className={clsx([
                  {
                    'placeholder:text-slate-200': !isLight,
                    'bg-black/10': !isLight,
                  },
                  'w-full',
                  'border-0',
                  'ml-3',
                  'h-12',
                ])}
                value={prompt}
                onKeyDown={(evt) => onKeyDown(evt)}
                onChange={(evt) =>
                  setPrompt(evt.target.value)
                }></Input>
              <ActionIcon className='mr-1' onClick={() => onSubmit()}>
                {/* loading={loading} */}
                {loading ? (
                  <IconSendOff color='#333' />
                ) : (
                  <IconSend color={prompt ? '#333' : '#ccc'} />
                )}
                {/* <IconSend></IconSend> */}
              </ActionIcon>
            </>
          ) : (
            <Voice
              sessionId={session.id}
              assistant={assistant!}></Voice>
          )}
        </div>
      </div>
    </>
  );
};
export default MessageComp;
