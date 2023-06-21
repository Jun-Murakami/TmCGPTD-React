import { useEffect, useState } from 'react';
import { TextField, Box } from '@mui/material';

export interface EditableTextAreaProps {
  isEditing: boolean;
  text: string;
  isSaved: boolean;
  setText: React.Dispatch<React.SetStateAction<string>>;
}

export function TextFieldMod({ isEditing, text, isSaved, setText }: EditableTextAreaProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditableText(event.target.value);
  };

  const [editableText, setEditableText] = useState<string>('');

  useEffect(() => {
    if (isEditing) {
      setEditableText(text);
    }
    if (isSaved && editableText !== text && editableText !== '') {
      setText(editableText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, isSaved]);

  return (
    <>
      {isEditing ? (
        <TextField
          multiline
          id='standard-multiline'
          variant='standard'
          sx={{ marginTop: -0.5, width: '100%', minHeight: 100 }}
          value={editableText}
          onChange={handleChange}
          fullWidth
        />
      ) : (
        <Box lineHeight={1.44} whiteSpace={'pre-wrap'}>
          {text}
        </Box>
      )}
    </>
  );
}
