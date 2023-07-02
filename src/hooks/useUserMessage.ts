import { useState, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { EditableMessageState } from '../types/types';

export function useUserMessage() {
  const userMessage = useChatStore((state) => state.roomState.lastUserMessage);
  const setRoomState = useChatStore((state) => state.setRoomState);

  const [userMessageState, setUserMessageState] = useState<EditableMessageState>({
    isTextEditing: false,
    isTextSaved: false,
  });
  const currentUserTextRef = useRef('');

  const handleUserEdit = () => {
    currentUserTextRef.current = userMessage!;
    setUserMessageState((prev) => ({ ...prev, isTextEditing: true, isTextSaved: false }));
  };

  const handleUserSaved = () => {
    setUserMessageState((prev) => ({ ...prev, isTextEditing: false, isTextSaved: true }));
  };

  const handleUserCancel = () => {
    setUserMessageState((prev) => ({ ...prev, isTextEditing: false }));
    setRoomState((prev) => ({ ...prev, lastUserMessage: currentUserTextRef.current }));
  };

  return {
    userMessageState,
    handleUserEdit,
    handleUserSaved,
    handleUserCancel,
  };
}
