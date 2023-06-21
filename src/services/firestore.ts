import { collection, doc, addDoc, updateDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from '../services/firebase';
import 'firebase/firestore';
import { Message, ChatRoom } from '../types/types';

export async function getChatRoomsDb(userId: string): Promise<ChatRoom[]> {
  const messagesQuery = query(
    collection(doc(db, 'Users', userId), 'ChatRooms'),
    orderBy('date', 'desc')
  );
  const querySnapshot = await getDocs(messagesQuery);
  console.log('getChatRoomsDb');
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
}

export async function getMessagesDb(userId: string, roomId: string): Promise<Message[]> {
  const messagesQuery = query(
    collection(doc(db, 'Users', userId), 'ChatRooms', roomId, 'Messages'),
    orderBy('date')
  );
  const querySnapshot = await getDocs(messagesQuery);
  console.log('getMessagesDb');
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
}

export async function createChatRoomAndMessagesDb(userId: string, roomName: string, messages: Message[]) {
  const date = serverTimestamp();

  // Create a new chat room
  const chatRoomsRef = collection(db, 'Users', userId, 'ChatRooms');
  const chatRoomRef = await addDoc(chatRoomsRef, { RoomName: roomName, date: date });

  // Get the ID of the new chat room
  const roomId = chatRoomRef.id;

  // Add messages to the chat room
  const messagesRef = collection(db, 'Users', userId, 'ChatRooms', roomId, 'Messages');
  for (const message of messages) {
    // Use serverTimestamp for the date
    await addDoc(messagesRef, { role: message.role, date: date, text: message.text });
  }

  console.log('createChatRoomAndMessagesDb');
  return roomId;
}

export async function addMessageDb(userId: string, roomId: string, messages: Message[]) {
  const messagesRef = collection(db, 'Users', userId, 'ChatRooms', roomId, 'Messages');
  for (const message of messages) {
    await addDoc(messagesRef, { ...message });
  }
  const chatRoomRef = doc(db, 'Users', userId, 'ChatRooms', roomId);
  await updateDoc(chatRoomRef, { date: serverTimestamp() });
  console.log('addMessageDb');
}

export async function updateMessageDb(userId: string, roomId: string, message: Message) {
  const messageRef = doc(db, 'Users', userId, 'ChatRooms', roomId, 'Messages', message.id!);
  await updateDoc(messageRef, { ...message });
  const chatRoomRef = doc(db, 'Users', userId, 'ChatRooms', roomId);
  await updateDoc(chatRoomRef, { date: serverTimestamp() });
  console.log('updateMessageDb');
}

export async function updateAssistantMessageDb(userId: string, roomId: string, message: Message) {
  const messageRef = doc(db, 'Users', userId, 'ChatRooms', roomId, 'Messages', message.id!);
  const date = serverTimestamp();
  await updateDoc(messageRef, { text: message.text, date, usage: message.usage });
  const chatRoomRef = doc(db, 'Users', userId, 'ChatRooms', roomId);
  await updateDoc(chatRoomRef, { date: serverTimestamp() });
  console.log('updateAssistantMessageDb');
}
