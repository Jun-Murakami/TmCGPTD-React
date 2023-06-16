// src/components/MessageList.tsx
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';

type Message = {
  role: 'user' | 'assistant';
  date: Date;
  text: string;
  usage: string;
};

function MessageList(userId: string, chatRoomTitle: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const userId = auth.currentUser?.uid;
      const chatRoomTitle = 'chatRoom1'; // Replace with actual chat room ID
      const messagesCollection = collection(db, `Users/${userId}/ChatRooms/${chatRoomTitle}/Messages`);
      const messagesQuery = query(messagesCollection, orderBy('date'));
      const messageDocs = await getDocs(messagesQuery);
      const messages = messageDocs.docs.map(doc => doc.data() as Message);
      setMessages(messages);
    };

    fetchMessages();
  }, [userId, chatRoomTitle]);

  return messages;
};

export default MessageList;
