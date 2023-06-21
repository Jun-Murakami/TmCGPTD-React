import { IconButton, Stack } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';

type EditPromptButtonProps = {
  isEditing: boolean;
  marginTop: number;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export function EditPromptButton({ isEditing, onEdit, onSave, onCancel, marginTop = 0 }: EditPromptButtonProps) {
  return (
    <>
      {!isEditing ? (
        <IconButton onClick={onEdit} sx={{ position: 'absolute', marginTop: marginTop }}>
          <EditNoteIcon sx={{ margin: 0, marginLeft: -0.8, marginTop: 1, fontSize: 30 }} />
        </IconButton>
      ) : (
        <Stack sx={{ position: 'absolute', marginTop: marginTop }}>
          <IconButton onClick={onSave}>
            <SaveOutlinedIcon sx={{ margin: 0, marginLeft: -0.8, marginTop: 1, fontSize: 30 }} />
          </IconButton>
          <IconButton onClick={onCancel}>
            <CloseIcon sx={{ margin: 0, marginLeft: -0.8, marginTop: -1, fontSize: 30 }} />
          </IconButton>
        </Stack>
      )}
    </>
  );
}
