import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Github } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  return (
    <header className="sticky top-0 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-sm py-4 px-6 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="text-xl font-semibold tracking-tight">
            <span className="text-primary-600 dark:text-primary-400">four</span>
            <span className="font-light">-sigma</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/daily" active={location.pathname === '/daily'}>Daily Play</NavLink>
          <NavLink to="/practice" active={location.pathname === '/practice'}>Explore</NavLink>
          <NavLink to="/questions" active={location.pathname === '/questions'}>Questions</NavLink>
          <NavLink to="/profile" active={location.pathname === '/profile'}>Profile</NavLink>
          <NavLink to="/about" active={location.pathname === '/about'}>About</NavLink>
        </nav>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-colors">
            <Github size={16} />
            <span className="hidden md:inline">Sign In</span>
          </button>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => {
  return (
    <Link
      to={to}
      className={`py-2 relative font-medium transition-colors ${
        active
          ? 'text-primary-600 dark:text-primary-400'
          : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400'
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400" />
      )}
    </Link>
  );
};

export default Header;