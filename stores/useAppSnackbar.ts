type SnackbarColor = "error" | "warning";

export const useAppSnackbar = () => {
  const showSnackbar = useState<boolean>("app-snackbar-visible", () => false);
  const snackbarMessage = useState<string>("app-snackbar-message", () => "");
  const snackbarColor = useState<SnackbarColor>("app-snackbar-color", () => "error");

  const openSnackbar = (message: string, color: SnackbarColor = "error") => {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    showSnackbar.value = true;
  };

  const closeSnackbar = () => {
    showSnackbar.value = false;
  };

  return {
    showSnackbar,
    snackbarMessage,
    snackbarColor,
    openSnackbar,
    closeSnackbar,
  };
};
