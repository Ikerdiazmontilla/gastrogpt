import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-W6S3V9N47Q', {
        page_path: location.pathname,
        page_location: window.location.href,
      });
    }
  }, [location]);

  return null;
}

export default Analytics;
