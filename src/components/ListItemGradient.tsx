import React, { useState } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import { ChatRoom } from '../types/ChatRoom';

type HandleChatRoomClick = (RoomId: string) => (event: React.MouseEvent) => void;

type ListItemComponentProps = {
  room: ChatRoom;
  currentRoomId: string;
  handleChatRoomClick: HandleChatRoomClick;
};

export function ListItemGradient({ room, currentRoomId, handleChatRoomClick }: ListItemComponentProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ListItem key={room.id} disablePadding>
      <ListItemButton
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleChatRoomClick(room.id!)}
        sx={{ transition: 'none', paddingTop: 1, paddingBottm: 1 }}
      >
        <ListItemIcon sx={{ marginTop: -1.5 }}>
          {room.id === currentRoomId ? <RateReviewOutlinedIcon /> : <ChatBubbleOutlineOutlinedIcon />}
        </ListItemIcon>
        <ListItemText
          sx={{ m: 0 }}
          primary={room.RoomName.length > 17 ? room.RoomName.substring(0, 15) : room.RoomName}
          secondary={room.date.toDate().toLocaleString()}
          secondaryTypographyProps={{ fontSize: '0.8rem' }}
          primaryTypographyProps={{
            component: 'div',
            sx: {
              left: -17,
              overflow: 'hidden',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '3em',
                height: '100%',
                backgroundImage: isHovered
                  ? 'linear-gradient(to right, rgba(245,245,245,0), rgba(245,245,245,1) 50%)'
                  : 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,1) 50%)',
                pointerEvents: 'none',
              },
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}
