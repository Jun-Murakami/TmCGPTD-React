import { create } from 'zustand';

type DialogState = {
  isDialogVisible: boolean;
  isDialogTwoButtons: boolean;
  dialogMessage: string;
  dialogTitle: string;
  resolveDialog: ((value: boolean | PromiseLike<boolean>) => void) | null;
  showDialog: (message: string, title: string, isTwoButtons?: boolean) => Promise<boolean>;
  hideDialog: () => void;
};

export const useDialogStore = create<DialogState>((set, get) => ({
  isDialogVisible: false,
  isDialogTwoButtons: false,
  dialogMessage: '',
  dialogTitle: '',
  resolveDialog: null,
  showDialog: (message, title, isTwoButtons = false) => {
    set({
      dialogMessage: message,
      dialogTitle: title,
      isDialogTwoButtons: isTwoButtons,
      isDialogVisible: true
    });

    return new Promise((resolve) => {
      set({ resolveDialog: resolve });
    });
  },
  hideDialog: () => {
    const resolveDialog = get().resolveDialog;
    if (typeof resolveDialog === 'function') {
      resolveDialog(false);
    }
    set({
      isDialogVisible: false,
      resolveDialog: null
    });
  }
}));