// 存储 chatLogs

import type {
  ChatLogsStorageType,
  MessageList,
  Session,
  SessionInfo,
  SessionList,
} from '@/types';
import { getLocal, setLocal } from './storage';
import { SESSTION_STORE, MESSAGE_STORE } from './constant';
import assistionStore from './assistionStore';

export const getMessageStore = () => {
  let list = getLocal<ChatLogsStorageType>(MESSAGE_STORE);
  if (!list) {
    list = {};
    setLocal(MESSAGE_STORE, list);
  }
  return list;
};

export const getMessage = (id: string) => {
  const logs = getMessageStore();
  return logs[id] || [];
};

export const updateMessage = (id: string, log: MessageList) => {
  const logs = getMessageStore();
  logs[id] = log;
  setLocal(MESSAGE_STORE, logs);
};

export const clearMessage = (id: string) => {
  const logs = getMessageStore();
  if (logs[id]) {
    logs[id] = [];
  }
  setLocal(MESSAGE_STORE, logs);
};

export const getSesssionStore = (): SessionList => {
  let list = getLocal<SessionList>(SESSTION_STORE);
  const assistant = assistionStore.getList()[0];
  if (!list) {
    const session = {
      name: 'chat',
      assistant: assistant.id,
      id: Date.now().toString(),
    };
    list = [session];
    updateMessage(session.id, []);
    setLocal(SESSTION_STORE, list);
  }
  return list;
};

export const updateSessionStore = (list: SessionList) => {
  setLocal(SESSTION_STORE, list);
};

export const addSession = (session: Session): SessionList => {
  const list = getSesssionStore();
  list.push(session);
  updateSessionStore(list);
  return list;
};
export const getSession = (id: string): SessionInfo | null => {
  const list = getSesssionStore();
  const session = list.find((val) => val.id === id) || null;
  if (!session) return null;
  const { assistant } = session;
  let assistantInfo = assistionStore.getAssistant(assistant);
  if (!assistantInfo) {
    assistantInfo = assistionStore.getList()[0];
    updateSession(session.id, { assistant: assistantInfo.id });
  }
  return {
    ...session,
    assistant: assistantInfo,
  };
};

export const updateSession = (
  id: string,
  data: Partial<Omit<Session, 'id'>>
): SessionList => {
  const list = getSesssionStore();
  const index = list.findIndex((val) => val.id === id);
  if (index > -1) {
    list[index] = {
      ...list[index],
      ...data,
    };
    updateSessionStore(list);
  }
  return list;
};

export const removeSession = (id: string) => {
  const list = getSesssionStore();
  const newList = list.filter((session) => session.id === id);
  updateSessionStore(newList);
  return newList;
};
