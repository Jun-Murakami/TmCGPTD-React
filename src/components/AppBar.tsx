import { useAppStore } from '../store/appStore';
import { useChatStore } from '../store/chatStore';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';

export function SearchAppBar() {
  const setDrawerIsOpen = useAppStore((state) => state.setDrawerIsOpen);
  const currentRoomName = useChatStore((state) => state.roomState.currentRoomName);
  const isNewChat = useChatStore((state) => state.roomState.isNewChat);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar sx={{ background: 'primary.main' }}>
        <Toolbar sx={{ background: 'primary.main' }}>
          <Typography variant='body1' noWrap component='div' sx={{ flexGrow: 1 }}>
            {isNewChat ? 'TmCGPT Debugger' : currentRoomName}
          </Typography>
          <IconButton
            size='large'
            edge='end'
            color='inherit'
            aria-label='open drawer'
            sx={{ ml: 0 }}
            onClick={() => setDrawerIsOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
