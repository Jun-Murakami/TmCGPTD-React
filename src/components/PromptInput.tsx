import { useState, useEffect } from 'react';
import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface TextInputProps {
  onSubmit: (inputValue: string) => void;
}

export function PromptInput({ onSubmit }: TextInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (inputValue.length > 0 && !isEditing) {
      setIsEditing(true);
    } else if (inputValue.length === 0 && isEditing) {
      setIsEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const handleButtonClick = () => {
    onSubmit(inputValue);
    setInputValue(''); // Clear the input field
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
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          multiline
          id='outlined-multiline-flexible'
          label='Send a message'
          variant='filled'
          maxRows={8}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton sx={{ zIndex: 1200, right: 0, bottom: 10 }} onClick={handleButtonClick} disabled={!isEditing}>
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
}
