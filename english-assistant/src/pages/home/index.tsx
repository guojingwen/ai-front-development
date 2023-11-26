import React, { useEffect, useState } from 'react';
import Message from '@/components/Message';
import SessionComp from '@/components/Session';
import NavHeader from '@/components/NavHeader';
import * as sessionStore from '@/dbs/sessionStore';
import * as assistantStore from '@/dbs/assistantStore';
import { Assistant, Session } from '@/types';
import events from '@/utils/event';

export default function Home() {
  const [session, setSession] = useState<Session>({} as Session);
  const [assistant, setAssistant] = useState<Assistant>(
    {} as Assistant
  );
  const onAssistantChange = (_assistant: Assistant) => {
    if (_assistant.id === assistant.id) return;
    if (localStorage.emptySessionId !== session.id) {
      events.emit('switchToNewSession');
      return;
    }
    setAssistant(_assistant);
    sessionStore.updateSession({
      ...session,
      assistantId: _assistant.id,
    });
  };

  useEffect(() => {
    (async () => {
      const assistants = await assistantStore.getList();
      setAssistant(assistants[0]);
      const sessions = await sessionStore.getSessions();
      setSession(sessions[0]);
    })();
  }, []);

  const toSetSession = async (_session: Session) => {
    localStorage.assistantId = _session.assistantId;
    setSession(_session);
    const assistant = await assistantStore.getAssistant(
      _session.assistantId
    );
    setAssistant(assistant!);
  };
  if (!session.id) return <div>loading</div>;
  return (
    <div className='h-screen w-screen flex'>
      <SessionComp
        session={session}
        onChange={toSetSession}></SessionComp>
      <div className='h-screen w-full flex flex-col items-center'>
        <NavHeader
          assistantId={assistant?.id || ''}
          onAssistantChange={onAssistantChange}
        />
        <Message session={session} assistant={assistant!}></Message>
      </div>
    </div>
  );
}
