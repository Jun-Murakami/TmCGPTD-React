import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5a3fb5',
    },
    secondary: {
      main: '#ef0a0a',
    },
  },
  typography: {
    fontFamily: 'Söhne,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif,Helvetica Neue,Arial,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji, sans-serif',
  },
  components: {
    MuiCssBaseline: {
        styleOverrides: `
        ::-webkit-scrollbar {
          width: 11px;
          height: 11px;
          background-color: transparent;
        },
        ::-webkit-scrollbar:hover {
          background-color: #cccccc;
        },
        ::-webkit-scrollbar-thumb {
          background: #7c7d87;
          opacity: 0.5;
          border-radius: 6px;
        }
        `
    },
  },
  
});