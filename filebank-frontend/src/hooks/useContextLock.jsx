import { Alert, AlertTitle } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useSnackbar } from 'notistack';

const useContextLock = ()=> {
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
          anchorOrigin: { vertical: 'center', horizontal: 'center' }
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
    const handleTouchStart = () => { touchStartTime = Date.now(); };
    const handleTouchEnd = () => {
      if (Date.now() - touchStartTime > 500) {
        // showError("Long press is disabled.");
      }
    };

    let lastTap = 0;
    const handleDoubleTap = () => {
      const now = Date.now();
      if (now - lastTap < 300) {
       // showError('This action is restricted.');
      }
      lastTap = now;
    };

    const handleBlur = () => {
      // if Google login popup is open, skip blur
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
    document.addEventListener("touchstart", handleDoubleTap);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchstart", handleDoubleTap);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [enqueueSnackbar]);
}
export default useContextLock;
