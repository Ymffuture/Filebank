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
        // showError("Copying or inspecting is disabled.");
      }
    };

    let touchStartTime = 0;
    let lastTap = 0;

    const handleTouchStart = () => {
      const now = Date.now();

      // Handle double tap
      if (now - lastTap < 300) {
      //  showError('This action is restricted.');
      }
      lastTap = now;

      // For long press
      touchStartTime = now;
    };

    const handleTouchEnd = () => {
      if (Date.now() - touchStartTime > 500) {
      //   showError("Long press is disabled.");
      }
    };

    const handleBlur = () => {
      const existingBanner = document.getElementById('focus-lost-banner');
      if (!existingBanner) {
        const banner = document.createElement('div');
        banner.id = 'focus-lost-banner';
        banner.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle, #000000ee, #1a1a1aee);
            color: #ffcc00;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            z-index: 9999;
            font-family: monospace;
            animation: fadeIn 0.5s ease-out forwards;
          ">
           Temporarily minimized / file upload.
          </div>
        `;
        document.body.appendChild(banner);
      }
    };

    const handleFocus = () => {
      const banner = document.getElementById('focus-lost-banner');
      if (banner) {
        banner.style.animation = 'fadeOut 0.3s ease-in forwards';
        setTimeout(() => {
          banner.remove();
        }, 300);
      }
    };

    // Add global animation styles
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }

      @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.95); }
      }
    `;
    document.head.appendChild(styleTag);

    // Attach listeners
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
      document.head.removeChild(styleTag);
    };
  }, [enqueueSnackbar]);

  return null;
};

export default useContentLock;

