import { useState, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { EditableMessageState } from '../types/types';

export function useSystemMessage() {
  const systemMessage = useChatStore((state) => state.roomState.systemMessage);
  const setRoomState = useChatStore((state) => state.setRoomState);

  const [systemMessageState, setSystemMessageState] = useState<EditableMessageState>({
    isTextEditing: false,
    isTextSaved: false,
  });
  const currentSystemTextRef = useRef('');

  const handleSystemEdit = () => {
    currentSystemTextRef.current = systemMessage!;
    setSystemMessageState((prev) => ({ ...prev, isTextEditing: true, isTextSaved: false }));
  };

  const handleSystemSaved = () => {
    setSystemMessageState((prev) => ({ ...prev, isTextEditing: false, isTextSaved: true }));
  };

  const handleSystemCancel = () => {
    setSystemMessageState((prev) => ({ ...prev, isTextEditing: false }));
    setRoomState((prev) => ({ ...prev, systemMessage: currentSystemTextRef.current }));
  };

  return {
    systemMessageState,
    handleSystemEdit,
    handleSystemSaved,
    handleSystemCancel,
  };
}
