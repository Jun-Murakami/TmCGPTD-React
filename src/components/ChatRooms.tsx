// src/components/MessageList.tsx
import { List, ListItem, ListItemText } from '@mui/material';
import useMessages from '../hooks/useMessages';

type MessageListProps = {
  userId: string;
  chatRoomId: string;
};

const MessageList: React.FC<MessageListProps> = ({ userId, chatRoomId }) => {
  const messages = useMessages(userId, chatRoomId);

  return (
    <List>
      {messages.map((message, index) => (
        <ListItem key={index}>
          <ListItemText primary={message.text} secondary={message.role} />
        </ListItem>
      ))}
    </List>
  );
};

export default MessageList;
