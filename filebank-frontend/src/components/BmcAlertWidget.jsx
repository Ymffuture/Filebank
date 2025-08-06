// components/BuyMeACoffeeWidget.jsx
import { useEffect } from 'react';

const BmcAlertWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.setAttribute('data-name', 'BMC-Widget');
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('src', 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js');
    script.setAttribute('data-id', 'ymffuture');
    script.setAttribute('data-description', 'Support me on Buy me a coffee!');
    script.setAttribute('data-message', 'Donate to improve the app');
    script.setAttribute('data-color', '#FF813F');
    script.setAttribute('data-position', 'Right');
    script.setAttribute('data-x_margin', '18');
    script.setAttribute('data-y_margin', '18');
    script.async = true;

    document.body.appendChild(script);

    return () => {
      // Optional cleanup to remove the script on unmount
      document.body.removeChild(script);
    };
  }, []);

  return null; // No visible JSX needed
};

export default BmcAlertWidget;
