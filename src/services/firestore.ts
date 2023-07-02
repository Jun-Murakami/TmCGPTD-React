import { Message, ChatRoom } from '../types/types';

export async function getChatRoomsDb(userId: string): Promise<ChatRoom[]> {

  //空を返す
  return [];
}

export async function getMessagesDb(userId: string, roomId: string): Promise<Message[]> {

  return [];
}

export async function createChatRoomAndMessagesDb(userId: string, roomName: string, messages: Message[]) {

  console.log('createChatRoomAndMessagesDb');
  return '';
}

export async function addMessageDb(userId: string, roomId: string, messages: Message[]) {

  console.log('addMessageDb');
}

export async function updateMessageDb(userId: string, roomId: string, message: Message) {
  console.log('updateMessageDb');
}

export async function updateAssistantMessageDb(userId: string, roomId: string, message: Message) {

  console.log('updateAssistantMessageDb');
}
