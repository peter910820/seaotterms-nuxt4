type ConfirmColor = "primary" | "warning" | "error";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmColor?: ConfirmColor;
}

let resolveConfirm: ((confirmed: boolean) => void) | undefined;

export const useAppConfirm = () => {
  const showConfirmDialog = useState<boolean>("app-confirm-visible", () => false);
  const confirmTitle = useState<string>("app-confirm-title", () => "");
  const confirmMessage = useState<string>("app-confirm-message", () => "");
  const confirmColor = useState<ConfirmColor>("app-confirm-color", () => "primary");

  const confirm = (options: ConfirmOptions) => {
    if (showConfirmDialog.value) return Promise.resolve(false);

    confirmTitle.value = options.title;
    confirmMessage.value = options.message;
    confirmColor.value = options.confirmColor ?? "primary";
    showConfirmDialog.value = true;

    return new Promise<boolean>((resolve) => {
      resolveConfirm = resolve;
    });
  };

  const closeConfirm = (confirmed: boolean) => {
    showConfirmDialog.value = false;
    resolveConfirm?.(confirmed);
    resolveConfirm = undefined;
  };

  return {
    showConfirmDialog,
    confirmTitle,
    confirmMessage,
    confirmColor,
    confirm,
    closeConfirm,
  };
};
