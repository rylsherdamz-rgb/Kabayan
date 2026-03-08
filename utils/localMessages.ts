import { MMKV, createMMKV } from "react-native-mmkv";

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

const storage = createMMKV({ id: "kabayan-messages" });
const STORAGE_KEY = "messages";

const seedMessages: ChatMessage[] = [
  { id: "msg1", roomId: "room-demo", senderId: "system", text: "Hi, this is a demo message.", createdAt: new Date().toISOString() },
  { id: "msg2", roomId: "room-demo", senderId: "me", text: "Great, I'm ready.", createdAt: new Date().toISOString() },
];

const readAll = (): ChatMessage[] => {
  const raw = storage.getString(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      storage.remove(STORAGE_KEY);
    }
  }
  storage.set(STORAGE_KEY, JSON.stringify(seedMessages));
  return seedMessages;
};

const writeAll = (messages: ChatMessage[]) => {
  storage.set(STORAGE_KEY, JSON.stringify(messages));
};

export const getMessagesForRoom = (roomId: string) =>
  readAll().filter((msg) => msg.roomId === roomId);

export const addMessageToRoom = (roomId: string, senderId: string, text: string) => {
  const messages = readAll();
  const msg: ChatMessage = {
    id: Math.random().toString(36).slice(2),
    roomId,
    senderId,
    text,
    createdAt: new Date().toISOString(),
  };
  const updated = [...messages, msg];
  writeAll(updated);
  return msg;
};

export const getAllMessages = () => readAll();
