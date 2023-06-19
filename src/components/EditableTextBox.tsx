import { TextField, Box } from '@mui/material';

interface EditableTextAreaProps {
  onEdit: () => void;
  onSave: () => void;
  isEditing: boolean;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
}

export function EditableTextBox({ isEditing = false, text, setText }: EditableTextAreaProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  return (
    <>
      {isEditing ? (
        <TextField multiline value={text} onChange={handleChange} sx={{ width: '100%' }} />
      ) : (
        <Box sx={{ pl: 1.5, width: '100%' }} margin={0} whiteSpace={'pre-wrap'}>
          {text}
        </Box>
      )}
    </>
  );
}
