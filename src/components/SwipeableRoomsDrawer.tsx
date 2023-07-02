import React from 'react';
import { useAppStore } from '../store/appStore';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { supabase } from '../hooks/useSupabaseSession';
import { useDialogStore, useInputDialogStore } from '../store/dialogStore';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  Stack,
  MenuItem,
  SwipeableDrawer,
  IconButton,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ListItemGradient } from './ListItemGradient';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import KeyIcon from '@mui/icons-material/Key';
import LogoutIcon from '@mui/icons-material/Logout';
import { SearchAppBar } from './AppBar';
import AES from 'crypto-js/aes';

export function SwipeableRoomsDrawer() {
  const uuid = useUserStore((state) => state.uuid);
  const roomState = useChatStore((state) => state.roomState);
  const setRoomState = useChatStore((state) => state.setRoomState);
  const setDrawerIsOpen = useAppStore((state) => state.setDrawerIsOpen);
  const drawerIsOpen = useAppStore((state) => state.drawerIsOpen);
  const apiModel = useAppStore((state) => state.apiModel);
  const setApiModel = useAppStore((state) => state.setApiModel);
  const showDialog = useDialogStore((state) => state.showDialog);
  const showInputDialog = useInputDialogStore((state) => state.showDialog);
  const setApiKey = useUserStore((state) => state.setApiKey);
  const setInputText = useAppStore((state) => state.setInputText);

  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleChatRoomClick = (RoomId: string) => () => {
    if (roomState.isNewChat) setRoomState((prev) => ({ ...prev, isNewChat: false }));
    setRoomState((prev) => ({ ...prev, currentRoomId: RoomId }));
  };

  const handleChangePassword = async () => {
    let result = await showInputDialog('', 'Enter your new password.', 'Password', true);
    if (result === null || result === '' || result === undefined) return;
    const { error } = await supabase.auth.updateUser({ password: result });
    if (error) {
      await showDialog('Password update failed: ' + error, 'Error');
    } else {
      await showDialog('Password has been updated.', 'Information');
    }
  };

  const handleDeleteAccount = async () => {
    let result = await showDialog(
      'Are you sure you want to delete your account? *All chat logs and templates stored in your account will be deleted.',
      'Confimation',
      true
    );
    if (result === null || result === undefined || !result) return;
    const { error } = await supabase.rpc('deleteUser');
    if (error) {
      await showDialog('Error deleting user. Please contact the administrator. (bucketrelaywebapp@gmail.com) ' + error, 'Error');
    } else {
      await showDialog('User deleted.', 'Success');
      await supabase.auth.signOut();
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) await showDialog('Error signing out: ' + error, 'Error');
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

  const handleNewChat = async () => {
    if (!roomState.isNewChat) {
      setRoomState((prev) => ({ ...prev, isNewChat: true, currentRoomId: '', currentRoomName: '', userInput: '' }));
      setInputText('');
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
          <MenuItem value='gpt-3.5-turbo-0613'>gpt-3.5-turbo-0613</MenuItem>
          <MenuItem value='gpt-4-0613'>gpt-4-0613</MenuItem>
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
            <ListItemText
              primary='API key'
              primaryTypographyProps={{ component: 'div', sx: { left: -17, overflow: 'hidden', position: 'relative' } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleSignOut}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary='Sign out'
              primaryTypographyProps={{ component: 'div', sx: { left: -17, overflow: 'hidden', position: 'relative' } }}
            />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleNewChat}>
            <ListItemIcon>
              <ReviewsOutlinedIcon />
            </ListItemIcon>
            <ListItemText
              primary='New chat'
              primaryTypographyProps={{ component: 'div', sx: { left: -17, overflow: 'hidden', position: 'relative' } }}
            />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        {roomState.chatRooms.map((room) => (
          <ListItemGradient
            key={room.id}
            currentRoomId={roomState.currentRoomId!}
            room={room}
            handleChatRoomClick={handleChatRoomClick}
          />
        ))}
      </List>
      <Divider />
      <Stack width={'100%'} textAlign={'center'}>
        <Button sx={{ m: 2 }} onClick={handleChangePassword}>
          <Typography variant='caption'>Change password</Typography>
        </Button>
        <Button sx={{ m: 2 }} onClick={handleDeleteAccount}>
          <Typography variant='caption'>Delete account</Typography>
        </Button>
      </Stack>
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
        disableBackdropTransition={!iOS}
        disableDiscovery={iOS}
        sx={{ zIndex: 9999 }}
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
