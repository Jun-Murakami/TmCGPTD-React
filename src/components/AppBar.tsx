import { useAppStore } from '../store/appStore';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';

export function SearchAppBar() {
  const setDrawerIsOpen = useAppStore((state) => state.setDrawerIsOpen);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar sx={{ background: 'primary.main' }}>
        <Toolbar sx={{ background: 'primary.main' }}>
          <Typography variant='h6' noWrap component='div' sx={{ flexGrow: 1 }}>
            TmCGPT Debugger
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
