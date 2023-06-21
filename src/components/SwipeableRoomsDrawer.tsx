import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useChatStore } from '../store/chatStore';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getChatRoomsDb } from '../services/firestore';
import { useDialogStore } from '../store/dialogStore';
import { useInputDialogStore } from '../store/dialogStore';
import { useUserStore } from '../store/userStore';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import IconButton from '@mui/material/IconButton';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import { ListItemGradient } from './ListItemGradient';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import KeyIcon from '@mui/icons-material/Key';
import LogoutIcon from '@mui/icons-material/Logout';
import { SearchAppBar } from './AppBar';
import AES from 'crypto-js/aes';

export function SwipeableRoomsDrawer() {
  const setDrawerIsOpen = useAppStore((state) => state.setDrawerIsOpen);
  const uid = useUserStore((state) => state.uid);
  const isNewChat = useChatStore((state) => state.isNewChat);
  const setIsNewChat = useChatStore((state) => state.setIsNewChat);
  const drawerIsOpen = useAppStore((state) => state.drawerIsOpen);
  const apiModel = useAppStore((state) => state.apiModel);
  const setChatRooms = useChatStore((state) => state.setChatRooms);
  const chatRooms = useChatStore((state) => state.chatRooms);
  const currentMessages = useChatStore((state) => state.currentMessages);
  const currentRoomId = useChatStore((state) => state.currentRoomId);
  const setCurrentRoomId = useChatStore((state) => state.setCurrentRoomId);
  const setApiModel = useAppStore((state) => state.setApiModel);
  const showDialog = useDialogStore((state) => state.showDialog);
  const showInputDialog = useInputDialogStore((state) => state.showDialog);
  const setApiKey = useUserStore((state) => state.setApiKey);

  const handleChatRoomClick = (RoomId: string) => (event: React.MouseEvent) => {
    if (isNewChat) setIsNewChat(false);
    setCurrentRoomId(RoomId);
  };

  useEffect(() => {
    const getChatRooms = async () => {
      getChatRoomsDb(uid!).then(setChatRooms);
    };
    getChatRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMessages.length]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      await showDialog('Error signing out: ' + error, 'Error');
    }
  };

  const handleKeyInput = async () => {
    try {
      let result = await showInputDialog(
        '*The key entered will not be sent to the app provider.',
        'Enter your API key.',
        'API key',
        true
      );
      if (result === null || result === '' || result === undefined) return;
      setApiKey(result);
      const encryptedKey = AES.encrypt(result, process.env.REACT_APP_SECRET_KEY!).toString();
      localStorage.setItem('encryptedKey', encryptedKey);
    } catch (error) {
      await showDialog('Error input key: ' + error, 'Error');
    }
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event &&
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setDrawerIsOpen(open);
  };

  const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  }));

  const list = () => (
    <Box sx={{ auto: 250 }} role='presentation' onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <Divider />
      <FormControl variant='standard' sx={{ m: 1, marginTop: 2, marginLeft: 2, minWidth: 120 }}>
        <InputLabel id='simple-select-standard-label'>API Model</InputLabel>
        <Select
          labelId='simple-select-standard-label'
          id='simple-select-standard'
          value={apiModel}
          onChange={(event) => setApiModel(event.target.value as string)}
          label='Model'
        >
          <MenuItem value='gpt-3.5-turbo'>gpt-3.5-turbo</MenuItem>
          <MenuItem value='gpt-4'>gpt-4</MenuItem>
          <MenuItem value='gpt-3.5-turbo-16k'>gpt-3.5-turbo-16k</MenuItem>
          <MenuItem value='gpt-4-32k'>gpt-4-32k</MenuItem>
        </Select>
      </FormControl>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleKeyInput}>
            <ListItemIcon>
              <KeyIcon />
            </ListItemIcon>
            <ListItemText primary='API key' />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleSignOut}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary='Sign out' />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        {chatRooms.map((room) => (
          <ListItemGradient key={room.id} currentRoomId={currentRoomId!} room={room} handleChatRoomClick={handleChatRoomClick} />
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <SearchAppBar />
      <SwipeableDrawer
        ModalProps={{
          keepMounted: true,
        }}
        anchor='right'
        open={drawerIsOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <DrawerHeader>
          <IconButton onClick={toggleDrawer(false)}>
            <ChevronRightIcon />
          </IconButton>
        </DrawerHeader>
        {list()}
      </SwipeableDrawer>
    </>
  );
}
