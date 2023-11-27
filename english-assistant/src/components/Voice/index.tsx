import React, { useState, useEffect, useMemo } from 'react';
import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import {
  IconMicrophone,
  IconLoader2,
  IconPointer,
  IconCircle,
} from '@tabler/icons-react';
import * as messageStore from '@/dbs/messageStore';
import { Assistant } from '@/types';
import MicroRecorder from 'mic-recorder-to-mp3';
import voiceRequest from '@/api/voice';
import clsx from 'clsx';

const Mp3Recorder = new MicroRecorder({
  bitRate: 1128,
});
export function Voice({
  sessionId,
  assistant,
}: {
  sessionId: string;
  assistant: Assistant;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isGranted, setIsGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const isDisabled = useMemo(() => {
    return isLoading || !isGranted || isPlaying;
  }, [isLoading, isGranted, isPlaying]);
  const { colorScheme } = useMantineColorScheme();
  const isLight = colorScheme === 'light';
  // get audio granted
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(
      () => {
        setIsGranted(true);
      },
      () => {
        setIsGranted(false);
      }
    );
  });
  const start = () => {
    Mp3Recorder.start().then(() => {
      setIsRecording(true);
    });
  };
  const end = () => {
    Mp3Recorder.stop()
      .getMp3()
      .then(([buffer, blob]: any) => {
        setIsRecording(false);
        answer(blob);
      });
  };

  const answer = async (blob: Blob) => {
    setIsLoading(true);
    // todo remove id sessionId
    const history = await messageStore.getMessages(sessionId);

    const resp = await voiceRequest({
      file: new File([blob], 'prompt.mp3'),
      history: history.slice(-assistant.max_log),
      options: assistant,
    });
    const { audioUrl, transcription, completion } = await resp.json();
    setIsLoading(false);
    console.log(audioUrl, transcription, completion);
    // setVideoMsg(completion);
    const audioElement = new Audio(
      `data:audio/wav;base64,${audioUrl}`
    );
    audioElement.addEventListener('play', () => {
      setIsPlaying(true);
    });
    audioElement.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    audioElement.play();
    console.log(resp);
  };

  return (
    <ActionIcon
      className='w-full flex flex-row items-center justify-center h-12'
      disabled={isDisabled}
      onMouseDown={start}
      onMouseUp={end}>
      {isLoading ? (
        <div className='flex items-center text-slate-500'>
          <IconLoader2
            size='1rem'
            className='animate-spin mr-2'></IconLoader2>
          加载中...
        </div>
      ) : isPlaying ? (
        <div className='flex items-center text-slate-500'>
          <IconCircle
            className='animate-ping mr-2'
            size='1rem'></IconCircle>
          Playing
        </div>
      ) : (
        <div
          className={clsx([
            {
              'text-gray-600': isLight,
            },
            'flex',
            'items-center',
          ])}>
          <IconPointer className='mr-2' size='1rem'></IconPointer>
          按住说话~
        </div>
      )}
      <IconMicrophone
        color={isRecording ? 'red' : 'green'}></IconMicrophone>
    </ActionIcon>
  );
}
