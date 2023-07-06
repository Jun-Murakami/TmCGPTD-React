import { Message, ChatRoom, Chat } from '../types/types';
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
    }));
  } else if (error) {
    new Error('Failed to load chat room list. ' + error.message);
  }
  return [];
}

export async function getChatroomDetailDb(roomId: number): Promise<ChatRoom | undefined> {
  const { data, error } = await supabase
    .from('chatrooms')
    .select('id, updated_on, title, category, last_prompt, json, json_prev')
    .eq('id', roomId);
  if (data) {
    const chatRoom: ChatRoom = {
      id: data[0].id,
      date: dateTimeRounder(new Date(data[0].updated_on)),
      roomName: data[0].title,
      category: data[0].category,
      lastPrompt: data[0].last_prompt,
      json: tryParseJson(data[0].json),
      jsonPrev: tryParseJson(data[0].json_prev),
    };
    return chatRoom;
  } else {
    new Error('Failed to load chat room. ' + error.message);
  }
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
      content: message.content
        .replace(/^#system/i, '')
        .replace('(!--editable--)', '')
        .replace(/---$/m, '')
        .replace(/^[\r\n\s]+|[\r\n\s]+$/g, ''),
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
  let chatMessages = messages.map(({ role, content }) => ({ role, content }));
  //chatMessagesをマップして、contentを置換処理
  chatMessages = chatMessages.map((chatMessage) => {
    chatMessage.content = chatMessage.content
      .replace(/^#system/i, '')
      .replace('(!--editable--)', '')
      .replace(/---$/m, '')
      .replace(/^[\r\n\s]+|[\r\n\s]+$/g, '');
    return chatMessage;
  });
  //jsonに変換
  const jsonChatMessages = JSON.stringify(chatMessages);
  const jsonSystemMessages = '[' + JSON.stringify(chatMessages[0]) + ']';

  const { data, error } = await supabase
    .from('chatrooms')
    .insert({
      user_id: uuid,
      updated_on: dateTimeRounder(new Date()),
      title: roomName,
      category: 'Web App',
      last_prompt: userMessages[0].content.replace('(!--editable--)', '').replace(/^[\r\n\s]+|[\r\n\s]+$/g, ''),
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

export async function addMessageDb(uuid: string, roomId: number, messages: Message[]) {
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
  console.log('addMessageDb');
}

export async function removeEditableMarkDb(lastUserMessageId: number) {
  const { data, error } = await supabase.from('messages').select('content').eq('id', lastUserMessageId);
  if (data !== null) {
    const { error } = await supabase
      .from('messages')
      .update({
        content: data[0].content.replace('(!--editable--)', ''),
      })
      .eq('id', lastUserMessageId);
    if (error) {
      new Error('Failed to remove editable text. ' + error.message);
    }
  } else if (error) {
    new Error('Failed to remove editable text. ' + error.message);
  }
}

export async function updateMessageDb(roomId: number, message: Message) {
  console.log('updateMessageDb');
}

export async function updateAssistantMessageDb(
  roomId: number,
  lastAssistantMessageId: number,
  message: Message,
  json: Chat[],
  jsonPrev: Chat[],
  lastUserMessage: string
) {
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
  } else {
    const { error } = await supabase
      .from('chatrooms')
      .update({
        updated_on: dateTimeRounder(message.date),
        json: JSON.stringify(json),
        json_prev: JSON.stringify(jsonPrev),
        last_prompt: lastUserMessage,
      })
      .eq('id', roomId);

    if (error) {
      new Error('Failed to update assistant message. ' + error.message);
    }
  }
  console.log('updateAssistantMessageDb');
}

export async function updateChatRoomNameDb(roomId: number, roomName: string) {
  const { error } = await supabase.from('chatrooms').update({ title: roomName }).eq('id', roomId);

  if (error) {
    new Error('Failed to update assistant message. ' + error.message);
  }
}

function dateTimeRounder(date: Date): Date {
  const timestampInSeconds = Math.round(date.getTime() / 1000); // ミリ秒を秒に変換し、小数部を切り捨て
  const dateRoundedToSeconds = new Date(timestampInSeconds * 1000); // 秒をミリ秒に戻し、新しいDateオブジェクトを作成
  return dateRoundedToSeconds;
}

function tryParseJson(jsonString: string): any[] {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return [];
  }
}
