import React from 'react';
import { useAppStore } from '../store/appStore';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { supabase } from '../hooks/useSupabaseSession';
import { useDialogStore, useInputDialogStore } from '../store/dialogStore';
import { updateChatRoomNameDb, getChatRoomsDb, deleteChatRoomDb } from '../services/supabaseDb';
import { styled } from '@mui/material/styles';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  SwipeableDrawer,
  IconButton,
  List,
  Divider,
  MenuItem,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PasswordIcon from '@mui/icons-material/Password';
import KeyIcon from '@mui/icons-material/Key';
import LogoutIcon from '@mui/icons-material/Logout';
import { AiIcon } from '../components/AiIcon';
import { ListItemGradient } from './ListItemGradient';
import { SearchAppBar } from './AppBar';
import AES from 'crypto-js/aes';

export function SwipeableRoomsDrawer() {
  const apiKey = useUserStore((state) => state.apiKey);
  const setApiKey = useUserStore((state) => state.setApiKey);
  const email = useUserStore((state) => state.email);
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const uuid = useUserStore((state) => state.uuid);
  const roomState = useChatStore((state) => state.roomState);
  const setRoomState = useChatStore((state) => state.setRoomState);
  const setDrawerIsOpen = useAppStore((state) => state.setDrawerIsOpen);
  const drawerIsOpen = useAppStore((state) => state.drawerIsOpen);
  const apiModel = useAppStore((state) => state.apiModel);
  const setApiModel = useAppStore((state) => state.setApiModel);
  const showDialog = useDialogStore((state) => state.showDialog);
  const showInputDialog = useInputDialogStore((state) => state.showDialog);

  const setInputText = useAppStore((state) => state.setInputText);

  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleChatRoomClick = (roomId: number, roomName: string) => () => {
    if (roomState.isNewChat) setRoomState((prev) => ({ ...prev, isNewChat: false }));
    setRoomState((prev) => ({ ...prev, currentRoomName: roomName, currentRoomId: roomId }));
  };

  const handleRoomNameEdit = async () => {
    let result = await showInputDialog('', 'Please enter a new title.', 'Chat title', roomState.currentRoomName!);
    if (result === null || result === '' || result === undefined || result === roomState.currentRoomName!) return;
    const error = await updateChatRoomNameDb(roomState.currentRoomId!, result);
    if (error) {
      await showDialog('Chat title update failed: ' + error, 'Error');
    } else {
      const newRooms = await getChatRoomsDb();
      setRoomState((prev) => ({ ...prev, chatRooms: newRooms, currentRoomName: result }));
    }
  };

  const handleDeleteRoom = async () => {
    const error = await deleteChatRoomDb(uuid!, roomState.currentRoomId!);
    if (error) {
      await showDialog('Failed to delete chat: ' + error, 'Error');
    } else {
      const newRooms = await getChatRoomsDb();
      setRoomState((prev) => ({
        ...prev,
        chatRooms: newRooms,
        isNewChat: true,
      }));
    }
  };

  const handleChangeEmail = async () => {
    let result = await showInputDialog('', 'Enter your new email address.', 'Email address', email);
    if (result === null || result === '' || result === undefined || result === email) return;
    const { error } = await supabase.auth.updateUser({ email: result });
    if (error) {
      await showDialog('Email address update failed: ' + error, 'Error');
    } else {
      const current = useUserStore.getState();
      setUserInfo(current.uuid, result, current.nickname, current.avatarUrl);
      await showDialog('Email address has been updated.', 'Information');
    }
  };

  const handleChangePassword = async () => {
    let result = await showInputDialog('', 'Enter your new password.', 'Password', '', true);
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
      'Are you sure you want to delete your account?\n*All chat logs and templates stored in your account will be deleted.',
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
        apiKey,
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
      setRoomState((prev) => ({
        ...prev,
        isNewChat: true,
        currentRoomId: undefined,
        currentRoomName: '',
        userInput: '',
      }));
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

  const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
    ({ theme }) => ({
      border: `1px solid ${theme.palette.divider}`,
      '&:not(:last-child)': {
        borderBottom: 0,
      },
      '&:before': {
        display: 'none',
      },
    })
  );

  const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
      onClick={(event) => event.stopPropagation()}
      expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
      {...props}
    />
  ))(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
      marginLeft: theme.spacing(1),
    },
  }));

  const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(0),
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
    borderTop: '1px solid rgba(0, 0, 0, .125)',
  }));

  const [expanded, setExpanded] = React.useState<string | false>('');

  const handleExpandChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

  const settingsItems = [
    { icon: <KeyIcon />, text: 'API key', handler: handleKeyInput },
    { icon: <MailOutlineIcon />, text: 'Change email address', handler: handleChangeEmail },
    { icon: <PasswordIcon />, text: 'Change password', handler: handleChangePassword },
    { icon: <PersonOffIcon />, text: 'Delete account', handler: handleDeleteAccount },
    { icon: <LogoutIcon />, text: 'Sign out', handler: handleSignOut },
  ];

  const list = () => (
    <Box sx={{ auto: 250 }} role='presentation' onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <AiIcon sx={{ fontSize: 24, m: 0 }} color='primary' />
            </ListItemIcon>
            <FormControl variant='standard' sx={{ marginLeft: -2, minWidth: 120 }}>
              <InputLabel id='simple-select-standard-label'>API Model</InputLabel>
              <Select
                labelId='simple-select-standard-label'
                id='simple-select-standard'
                value={apiModel}
                onChange={(event) => setApiModel(event.target.value as string)}
                onClick={(event) => event.stopPropagation()}
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
          </ListItemButton>
        </ListItem>
      </List>
      <Accordion expanded={expanded === 'panel1'} onChange={handleExpandChange('panel1')}>
        <AccordionSummary aria-controls='panel1d-content' id='panel1d-header'>
          <Typography marginLeft={2}>Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {settingsItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={item.handler}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ component: 'div', sx: { left: -17, overflow: 'hidden', position: 'relative' } }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
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
            handleRoomNameEdit={handleRoomNameEdit}
            handleDeleteRoom={handleDeleteRoom}
            handleChatRoomClick={handleChatRoomClick}
          />
        ))}
      </List>
      <Divider />
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
