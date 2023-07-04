import { Message, ChatRoom } from '../types/types';
import { supabase } from '../hooks/useSupabaseSession';

export async function getChatRoomsDb(userId: string): Promise<ChatRoom[]> {
  const { data, error } = await supabase
    .from('chatrooms')
    .select('id, updated_on, title, category, last_prompt, json, json_prev')
    .order('updated_on', { ascending: false });
  if (data) {
    return data.map((chatRoom) => ({
      id: chatRoom.id,
      date: new Date(chatRoom.updated_on),
      RoomName: chatRoom.title,
      category: chatRoom.category,
      lastPrompt: chatRoom.last_prompt,
      json: chatRoom.json,
      jsonprev: chatRoom.json_prev,
    }));
  } else if (error) {
    console.log('error', error);
  }
  return [];
}

export async function getMessagesDb(userId: string, roomId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, role, created_on, content, usage, room_id')
    .eq('room_id', roomId)
    .order('id', { ascending: true });
  if (data) {
    console.log('getMessagesDb', data);
    return data.map((message) => ({
      id: message.id,
      role: message.role,
      date: new Date(message.created_on),
      text: message.content,
      usage: message.usage,
    }));
  } else if (error) {
    console.log('error', error);
  }
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
