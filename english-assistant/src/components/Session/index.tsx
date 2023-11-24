import React, { useEffect, useState } from 'react';
import * as chatStorage from '@/utils/chatStorage';
import { SessionList } from '@/types';
import { useMantineColorScheme, ActionIcon } from '@mantine/core';
import { IconTrash, IconMessagePlus } from '@tabler/icons-react';
import clsx from 'clsx';
import { EdittableText } from '../EdittableText';

type Props = {
  sessionId: string;
  onChange: (arg: string) => void;
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

const Session = ({ sessionId, onChange }: Props) => {
  const [sessionList, setSessionList] = useState<SessionList>([]);
  const { colorScheme } = useMantineColorScheme();
  useEffect(() => {
    const list = chatStorage.getSesssionStore();
    setSessionList(list);
  }, []);
  const createSession = () => {
    const newSession = {
      name: `session=${sessionList.length + 1}`,
      id: Date.now().toString(),
    };
    onChange(newSession.id);
    const list = chatStorage.addSession(newSession as any);
    setSessionList(list);
  };
  const removeSession = (id: string) => {
    let list = chatStorage.removeSession(id);
    if (sessionId === id) {
      onChange(list[0].id);
    }
    setSessionList(list);
  };
  const updateSession = (id: string, name: string) => {
    const newSessionList = chatStorage.updateSession(id, { name });
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
        {sessionList.map(({ id, name }) => (
          <div
            key={id}
            onClick={() => onChange(id)}
            className={generateItemClasses(
              id,
              sessionId,
              colorScheme
            )}>
            <EdittableText
              text={name}
              onSave={(name) =>
                updateSession(id, name)
              }></EdittableText>
            {/* <div>{name}</div> */}
            {sessionList.length > 1 ? (
              <IconTrash
                size='.8rem'
                color='grey'
                onClick={(event) => {
                  event.stopPropagation();
                  removeSession(id);
                }}
                className='mx-1 invisible group-hover:visible'></IconTrash>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Session;