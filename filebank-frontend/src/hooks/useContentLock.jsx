import { useEffect } from 'react';
import { Alert, AlertTitle } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useSnackbar } from 'notistack';

const useContentLock = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const showError = (msg) => {
      enqueueSnackbar(
        <Alert
          severity="warning"
          icon={<WarningAmberIcon fontSize="inherit" />}
          sx={{ width: '100%' }}
        >
          <AlertTitle>Heads Up!</AlertTitle>
          {msg}
        </Alert>,
        {
          variant: 'default',
          anchorOrigin: { vertical: 'center', horizontal: 'center' },
        }
      );
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      // showError("Right-click is disabled on this site.");
    };

    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && ["c", "u", "p", "s"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        showError("Copying or inspecting is disabled.");
      }
    };

    let touchStartTime = 0;
    let lastTap = 0;

    const handleTouchStart = () => {
      const now = Date.now();

      // Handle double tap
      if (now - lastTap < 300) {
        // showError('This action is restricted.');
      }
      lastTap = now;

      // For long press
      touchStartTime = now;
    };

    const handleTouchEnd = () => {
      if (Date.now() - touchStartTime > 500) {
        // showError("Long press is disabled.");
      }
    };

    const handleBlur = () => {
      const googleIframe = document.querySelector('iframe[src*="accounts.google.com"]');
      if (!googleIframe) {
        document.body.style.transition = 'filter 0.3s ease-in-out';
        document.body.style.filter = 'blur(10px)';
      }
    };

    const handleFocus = () => {
      document.body.style.transition = 'filter 0.3s ease-in-out';
      document.body.style.filter = 'none';
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [enqueueSnackbar]);

  return null; // Optional, but makes intent clear
};

export default useContentLock;

