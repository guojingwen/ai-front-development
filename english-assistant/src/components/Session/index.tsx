import React, { useEffect, useState } from 'react';
import * as sessionStore from '@/dbs/sessionStore';
import { Session, SessionList } from '@/types';
import { useMantineColorScheme, ActionIcon } from '@mantine/core';
import { IconTrash, IconMessagePlus } from '@tabler/icons-react';
import clsx from 'clsx';
import { EdittableText } from '../EdittableText';
import events from '@/utils/event';
import { useGetState } from '@/utils/hooks';

type Props = {
  session: Session;
  onChange: (arg: Session) => void;
};
const itemBaseClasses =
  'flex cursor-pointer h-[2.4rem] items-center justify-around group px-4 rounded-md';
const generateItemClasses = (
  id: string,
  sessionId: string,
  colorScheme: string
) => {
  return clsx([
    itemBaseClasses,
    colorScheme,
    {
      'hover:bg-gray-300/60': colorScheme === 'light',
      'bg-gray-200/60': id !== sessionId && colorScheme === 'light',
      'bg-gray-300': id === sessionId && colorScheme === 'light',
      'hover:bg-zinc-800/50': colorScheme === 'dark',
      'bg-zinc-800/20': id !== sessionId && colorScheme === 'dark',
      'bg-zinc-800/90': id === sessionId && colorScheme === 'dark',
    },
  ]);
};

const SessionComp = ({ session, onChange }: Props) => {
  const [, setSessionList, getSessionList] = useGetState<SessionList>(
    []
  );
  const { colorScheme } = useMantineColorScheme();
  const createSession = async () => {
    if (localStorage.emptySessionId) return;
    const sessionId = Date.now().toString();
    localStorage.emptySessionId = sessionId;
    const newSession: Session = {
      name: `session=${getSessionList().length + 1}`,
      id: sessionId,
      assistantId: localStorage.assistantId,
    };
    const list = await sessionStore.addSession(newSession);
    setSessionList(list);
    onChange(newSession);
  };
  useEffect(() => {
    sessionStore.getSessions().then(setSessionList);
    events.on('switchToNewSession', async () => {
      if (localStorage.emptySessionId) {
        const sessionList = await sessionStore.getSessions();
        onChange(sessionList[0]);
      } else {
        createSession();
      }
    });
  }, []);
  const removeSession = async (id: string) => {
    if (localStorage.emptySessionId === id) {
      localStorage.emptySessionId = '';
    }
    await sessionStore.removeSession(id);
    const list = getSessionList().filter(
      (session) => session.id !== id
    );
    onChange(list[0]);
    setSessionList(list);
  };
  const updateSession = async (_session: Session, name: string) => {
    const newSessionList = await sessionStore.updateSession({
      ..._session,
      name,
    });
    setSessionList(newSessionList);
  };
  return (
    <div
      className={clsx(
        {
          'bg-black/10': colorScheme === 'dark',
          'bg-gray-100': colorScheme === 'light',
        },
        'h-screen',
        'w-64',
        'flex',
        'flex-col',
        'px-2'
      )}>
      <div className='flex justify-between py-2 w-full'>
        <ActionIcon
          onClick={() => createSession()}
          color='green'
          size='sm'>
          <IconMessagePlus size='1rem'></IconMessagePlus>
        </ActionIcon>
      </div>
      <div
        className={clsx([
          'pd-4',
          'overflow-y-auto',
          'scrollbar-none',
          'flex',
          'flex-col',
          'gap-y-2',
        ])}>
        {getSessionList().map((_session) => (
          <div
            key={_session.id}
            onClick={() => {
              if (_session.id !== session.id) {
                onChange(_session);
              }
            }}
            className={generateItemClasses(
              _session.id,
              session.id,
              colorScheme
            )}>
            <EdittableText
              text={_session.name}
              onSave={(name) =>
                updateSession(_session, name)
              }></EdittableText>
            {/* <div>{name}</div> */}
            {getSessionList().length > 1 ? (
              <IconTrash
                size='.8rem'
                color='grey'
                onClick={(event) => {
                  event.stopPropagation();
                  removeSession(_session.id);
                }}
                className='mx-1 invisible group-hover:visible'></IconTrash>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionComp;
