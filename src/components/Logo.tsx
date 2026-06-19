
import React from 'react';

interface LogoProps {
  className?: string;
  iconColor?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-8" }) => {
  return (
    <div className={className}>
      <img 
        src="https://app.adstrack.com.br/assets/ads-logo-preto-ihher5Lm.png" 
        alt="AdsTrack" 
        className="h-full w-auto dark:hidden"
        referrerPolicy="no-referrer"
      />
      <img 
        src="https://app.adstrack.com.br/assets/ads-logo-branco-HJ3-AwHk.png" 
        alt="AdsTrack" 
        className="h-full w-auto hidden dark:block"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export const LogoIcon: React.FC<LogoProps> = ({ className = "h-8" }) => (
    <div className={className}>
      <img 
        src="https://app.adstrack.com.br/assets/ads-logo-preto-ihher5Lm.png" 
        alt="AdsTrack Logo" 
        className="h-full w-auto dark:hidden"
        referrerPolicy="no-referrer"
      />
      <img 
        src="https://app.adstrack.com.br/assets/ads-logo-branco-HJ3-AwHk.png" 
        alt="AdsTrack Logo" 
        className="h-full w-auto hidden dark:block"
        referrerPolicy="no-referrer"
      />
    </div>
);
