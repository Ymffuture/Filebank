// src/hooks/useNetworkStatus.js

import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { WifiOff, Wifi } from 'lucide-react';

const useNetworkStatus = () => {
  const toastIdRef = useRef(null);

  useEffect(() => {
    const toastStyle = {
      background: '#555',
      color: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
    };

    const iconStyle = {
      marginRight: 8,
      opacity: 0.8,
    };

    const handleOnline = () => {
      if (toastIdRef.current !== null) {
        toast.update(toastIdRef.current, {
          render: (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <Wifi size={18} style={iconStyle} />
              <span>Back Online</span>
            </span>
          ),
          type: 'default',
          style: toastStyle,
          isLoading: false,
          autoClose: 2500,
          closeOnClick: false,
          draggable: false,
          icon: false,
        });
        toastIdRef.current = null;
      }
    };

    const handleOffline = () => {
      if (toastIdRef.current === null) {
        toastIdRef.current = toast(
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <WifiOff size={18} style={iconStyle} />
            <span>You are Offline</span>
          </span>,
          {
            type: 'default',
            style: toastStyle,
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            icon: false,
            isLoading: true,
          }
        );
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
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

