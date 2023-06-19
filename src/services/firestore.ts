import { collection, doc, addDoc, updateDoc, getDocs, query, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from '../services/firebase';
import 'firebase/firestore';

export type Message = {
  id?: string;
  role: 'system' | 'user' | 'assistant';
  date: Timestamp;
  text: string;
  usage?: string;
};

export async function getMessages(userId: string, roomId: string): Promise<Message[]> {
  const messagesQuery = query(
    collection(doc(db, 'Users', userId), 'ChatRooms', roomId, 'Messages'),
    orderBy('date')
  );
  const querySnapshot = await getDocs(messagesQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
}

export async function createChatRoomAndMessages(userId: string, roomName: string, messages: Message[]) {
  // Create a new chat room
  const chatRoomsRef = collection(db, 'Users', userId, 'ChatRooms');
  const chatRoomRef = await addDoc(chatRoomsRef, { RoomName: roomName });

  // Get the ID of the new chat room
  const roomId = chatRoomRef.id;

  // Add messages to the chat room
  const messagesRef = collection(db, 'Users', userId, 'ChatRooms', roomId, 'Messages');
  for (const message of messages) {
    // Use serverTimestamp for the date
    const date = serverTimestamp();
    await addDoc(messagesRef, { role: message.role, date, text: message.text });
  }
  return roomId;
}

export async function updateMessage(userId: string, roomId: string, message: Message) {
  const messageRef = doc(db, 'Users', userId, 'ChatRooms', roomId, 'Messages', message.id!);
  await updateDoc(messageRef, { ...message });
}
