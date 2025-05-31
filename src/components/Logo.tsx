import React from 'react';
import { Activity } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = 'h-6 w-6' }) => {
  return <Activity className={`text-primary-600 dark:text-primary-400 ${className}`} />;
};

export default Logo;