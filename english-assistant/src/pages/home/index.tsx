import React, { useEffect, useState } from 'react';
import Message from '@/components/Message';
import Session from '@/components/Session';
import NavHeader from '@/components/NavHeader';
import * as chatStorage from '@/utils/chatStorage';
import { Assistant } from '@/types';

export default function Home() {
  const [sessionId, setSessionId] = useState<string>('');
  const [assistant, setAssistant] = useState<Assistant>();
  const onAssistantChange = (assistant: Assistant) => {
    setAssistant(assistant);
    chatStorage.updateSession(sessionId, {
      assistant: assistant.id,
    });
  };

  useEffect(() => {
    const session = chatStorage.getSession(sessionId);
    setAssistant(session?.assistant);
  }, [sessionId]);
  useEffect(() => {
    const init = () => {
      const list = chatStorage.getSesssionStore();
      const id = list[0].id;
      setSessionId(id);
    };
    init();
  }, []);
  return (
    <div className='h-screen w-screen flex'>
      <Session
        sessionId={sessionId}
        onChange={setSessionId}></Session>
      <div className='h-screen w-full flex flex-col items-center'>
        <NavHeader
          assistantId={assistant?.id || ''}
          onAssistantChange={onAssistantChange}
        />
        <Message
          sessionId={sessionId}
          assistant={assistant!}></Message>
      </div>
    </div>
  );
}
