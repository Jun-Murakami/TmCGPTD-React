import React, { useState } from 'react';
import { IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { ChatRoom } from '../types/types';

type HandleChatRoomClick = (roomId: number, roomName: string, category: string) => (event: React.MouseEvent) => void;

type ListItemComponentProps = {
  room: ChatRoom;
  currentRoomId: number;
  handleRoomNameEdit: () => void;
  handleDeleteRoom: () => void;
  handleChatRoomClick: HandleChatRoomClick;
};

export function ListItemGradient({
  room,
  currentRoomId,
  handleRoomNameEdit,
  handleDeleteRoom,
  handleChatRoomClick,
}: ListItemComponentProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <ListItem key={room.id} disablePadding sx={room.id === currentRoomId ? { background: 'rgba(245, 245, 245, 1)' } : {}}>
      <ListItemButton
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleChatRoomClick(room.id!, room.roomName!, room.category!)}
        sx={{ transition: 'none', paddingTop: 1, paddingBottm: 1 }}
      >
        <ListItemIcon sx={{ marginTop: -1.5, marginRight: -2 }}>
          {room.id === currentRoomId && !isDeleting ? (
            <RateReviewOutlinedIcon />
          ) : room.id === currentRoomId && isDeleting ? (
            <DeleteForeverOutlinedIcon />
          ) : (
            <ChatBubbleOutlineOutlinedIcon />
          )}
        </ListItemIcon>
        {room.id === currentRoomId && !isDeleting ? (
          <>
            <IconButton
              onClick={handleRoomNameEdit}
              size={'small'}
              sx={{ position: 'absolute', right: 30, top: 3, color: 'grey.500', zIndex: 9999 }}
            >
              <DriveFileRenameOutlineOutlinedIcon />
            </IconButton>
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                setIsDeleting(true);
              }}
              size={'small'}
              sx={{ position: 'absolute', right: 0, top: 3, color: 'grey.500', zIndex: 9999 }}
            >
              <DeleteForeverOutlinedIcon />
            </IconButton>
          </>
        ) : room.id === currentRoomId && isDeleting ? (
          <>
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                handleDeleteRoom();
              }}
              size={'small'}
              sx={{ position: 'absolute', right: 30, top: 3, color: 'grey.500', zIndex: 9999 }}
            >
              <DoneIcon />
            </IconButton>
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                setIsDeleting(false);
              }}
              size={'small'}
              sx={{ position: 'absolute', right: 0, top: 3, color: 'grey.500', zIndex: 9999 }}
            >
              <CloseIcon />
            </IconButton>
          </>
        ) : (
          '' //Do nothing
        )}
        <ListItemText
          sx={
            room.id === currentRoomId
              ? { width: 150, maxWidth: '70%', m: 0, p: 0, whiteSpace: 'nowrap', overflow: 'hidden' }
              : { width: 230, maxWidth: '90%', m: 0, p: 0, whiteSpace: 'nowrap', overflow: 'hidden' }
          }
          primary={room.roomName.length > 35 ? room.roomName.substring(0, 35) : room.roomName}
          secondary={room.date.toLocaleDateString() + ' - ' + room.category}
          secondaryTypographyProps={{ fontSize: '0.8rem' }}
          primaryTypographyProps={{
            component: 'div',
            sx: {
              left: 0,
              marginLeft: 0,
              marginRight: -5,
              overflow: 'hidden',
              width: '100%',
              paddingRight: '0',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '5em',
                height: '100%',
                backgroundImage:
                  isHovered || room.id === currentRoomId
                    ? 'linear-gradient(to right, rgba(245,245,245,0), rgba(245,245,245,1) 100%)'
                    : 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,1) 100%)',
                pointerEvents: 'none',
              },
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}
