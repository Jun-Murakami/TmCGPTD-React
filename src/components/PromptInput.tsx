import React from 'react';
import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface TextInputProps {
  onClick: () => void;
}

export const PromptInput = React.memo(({ onClick }: TextInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputText = useAppStore((state) => state.inputText);
  const setInputText = useAppStore((state) => state.setInputText);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
    if (event.target.value.length > 0 && !isEditing) {
      setIsEditing(true);
    } else if (event.target.value.length === 0 && isEditing) {
      setIsEditing(false);
    }
  };

  return (
    <Box display='flex' alignItems='center' justifyContent='center' position='fixed' bottom={10} width='100vw'>
      <Box
        bgcolor={'white'}
        sx={{
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
        }}
      >
        <TextField
          value={inputText}
          onChange={handleChange}
          multiline
          id='outlined-multiline-flexible'
          label='Send a message'
          variant='filled'
          maxRows={8}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton sx={{ zIndex: 9999, right: 2, bottom: 10 }} onClick={onClick} disabled={!isEditing}>
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: '250px',
            width: '88vw',
            maxWidth: '800px',
            boxShadow: 10,
            WebkitBoxShadow: 10,
            MozBoxShadow: 10,
          }}
        ></TextField>
      </Box>
    </Box>
  );
});
