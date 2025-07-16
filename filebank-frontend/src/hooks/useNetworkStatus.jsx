// src/hooks/useNetworkStatus.js

import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { WifiOff, Wifi } from 'lucide-react';

const useNetworkStatus = () => {
  const toastIdRef = useRef(null);

  useEffect(() => {
    const handleOnline = () => {
      if (toastIdRef.current !== null) {
        toast.update(toastIdRef.current, {
          render: (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <Wifi size={16} style={{ marginRight: 8 }} /> Back Online
            </span>
          ),
          type: 'success',
          isLoading: false,
          autoClose: 3000,
          icon: false,
        });
        toastIdRef.current = null;
      }
    };

    const handleOffline = () => {
      if (toastIdRef.current === null) {
        toastIdRef.current = toast(
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <WifiOff size={16} style={{ marginRight: 8 }} /> You are Offline
          </span>,
          {
            type: 'error',
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            icon: false,
          }
        );
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
};

export default useNetworkStatus;
