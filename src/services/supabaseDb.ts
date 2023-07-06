import { Message, ChatRoom } from '../types/types';
import { supabase } from '../hooks/useSupabaseSession';

export async function getChatRoomsDb(): Promise<ChatRoom[]> {
  const { data, error } = await supabase
    .from('chatrooms')
    .select('id, updated_on, title, category, last_prompt, json, json_prev')
    .order('updated_on', { ascending: false });
  if (data) {
    return data.map((chatRoom) => ({
      id: chatRoom.id,
      date: dateTimeRounder(new Date(chatRoom.updated_on)),
      roomName: chatRoom.title,
      category: chatRoom.category,
      lastPrompt: chatRoom.last_prompt,
      json: chatRoom.json,
      jsonprev: chatRoom.json_prev,
    }));
  } else if (error) {
    new Error('Failed to load chat room list. ' + error.message);
  }
  return [];
}

export async function getMessagesDb(roomId: number): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, role, created_on, content, usage, room_id')
    .eq('room_id', roomId)
    .order('id', { ascending: true });
  if (data) {
    //console.log('getMessagesDb', data);
    return data.map((message) => ({
      id: message.id,
      role: message.role,
      date: dateTimeRounder(new Date(message.created_on)),
      content: message.content,
      usage: message.usage,
    }));
  } else if (error) {
    new Error('Failed to load messages. ' + error.message);
  }
  return [];
}

export async function createChatRoomAndMessagesDb(
  uuid: string,
  roomName: string = '',
  messages: Message[]
): Promise<number | undefined> {
  //messagesの中のuserロールのcontentを抽出
  const userMessages = messages.filter((message) => message.role === 'user');
  const chatMessages = messages.map(({ role, content }) => ({ role, content }));
  const jsonChatMessages = JSON.stringify(chatMessages);
  const jsonSystemMessages = '[' + JSON.stringify(chatMessages[0]) + ']';

  const { data, error } = await supabase
    .from('chatrooms')
    .insert({
      user_id: uuid,
      updated_on: dateTimeRounder(new Date()),
      title: roomName,
      category: 'Web App',
      last_prompt: userMessages[0].content,
      json: jsonChatMessages,
      json_prev: jsonSystemMessages,
    })
    .select();
  if (data) {
    console.log('createChatRoomAndMessagesDb', data);
    const roomId: number = data[0].id;
    //messagesを反復
    for (const message of messages) {
      const { error } = await supabase.from('messages').insert({
        user_id: uuid,
        room_id: roomId,
        role: message.role,
        created_on: dateTimeRounder(message.date),
        content: message.content,
        usage: message.usage,
      });
      if (error) {
        new Error('Failed to create messages. ' + error.message);
      }
    }
    return roomId;
  } else if (error) {
    new Error('Failed to create chat room. ' + error.message);
  }
  return undefined;
}

export async function addMessageDb(roomId: number, messages: Message[]) {
  console.log('addMessageDb');
}

export async function updateMessageDb(roomId: number, message: Message) {
  console.log('updateMessageDb');
}

export async function updateAssistantMessageDb(roomId: number, lastAssistantMessageId: number, message: Message) {
  const { error } = await supabase
    .from('messages')
    .update({
      created_on: dateTimeRounder(message.date),
      content: message.content,
      usage: message.usage,
    })
    .eq('id', lastAssistantMessageId);
  if (error) {
    new Error('Failed to update assistant message. ' + error.message);
  }
  console.log('updateAssistantMessageDb');
}

function dateTimeRounder(date: Date): Date {
  const timestampInSeconds = Math.round(date.getTime() / 1000); // ミリ秒を秒に変換し、小数部を切り捨て
  const dateRoundedToSeconds = new Date(timestampInSeconds * 1000); // 秒をミリ秒に戻し、新しいDateオブジェクトを作成
  return dateRoundedToSeconds;
}
