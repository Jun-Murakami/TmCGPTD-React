import React from 'react';
import { useAppUiStore } from '../store/appStore';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useDialogStore } from '../store/dialogStore';
import { useInputDialogStore } from '../store/dialogStore';
import { useUserStore } from '../store/userStore';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import IconButton from '@mui/material/IconButton';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import KeyIcon from '@mui/icons-material/Key';
import LogoutIcon from '@mui/icons-material/Logout';
import { SearchAppBar } from './AppBar';
import AES from 'crypto-js/aes';

export function SwipeableRoomsDrawer() {
  const setDrawerIsOpen = useAppUiStore((state) => state.setDrawerIsOpen);
  const drawerIsOpen = useAppUiStore((state) => state.drawerIsOpen);
  const showDialog = useDialogStore((state) => state.showDialog);
  const showInputDialog = useInputDialogStore((state) => state.showDialog);
  const setApiKey = useUserStore((state) => state.setApiKey);

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
        'API key'
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
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
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
    </Box>
  );

  return (
    <>
      <SearchAppBar />
      <SwipeableDrawer anchor='right' open={drawerIsOpen} onClose={toggleDrawer(false)} onOpen={toggleDrawer(true)}>
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
