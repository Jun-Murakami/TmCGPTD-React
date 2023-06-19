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
      dialogTitle: title,
      dialogMessage: message,
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

type inputDialogState = {
  isDialogVisible: boolean;
  dialogMessage: string;
  dialogTitle: string;
  dialogLabel: string;
  isPassword: boolean;
  resolveDialog: ((value: string | PromiseLike<string>) => void) | null;
  showDialog: (message: string, title: string, label: string, isPassword?: boolean) => Promise<string>;
  hideDialog: () => void;
};

export const useInputDialogStore = create<inputDialogState>((set, get) => ({
  isDialogVisible: false,
  dialogMessage: '',
  dialogTitle: '',
  dialogLabel: '',
  isPassword: false,
  resolveDialog: null,
  showDialog: (message, title, label, isPassword=false) => {
    set({
      dialogTitle: title,
      dialogMessage: message,
      dialogLabel: label,
      isPassword: isPassword,
      isDialogVisible: true
    });

    return new Promise((resolve) => {
      set({ resolveDialog: resolve });
    });
  },
  hideDialog: () => {
    const resolveDialog = get().resolveDialog;
    if (typeof resolveDialog === 'function') {
      resolveDialog('');
    }
    set({
      isDialogVisible: false,
      resolveDialog: null
    });
  }
}));