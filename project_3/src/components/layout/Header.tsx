import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, LogOut } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const { currentUser, signOut } = useAuth();

  return (
    <header className="bg-background h-16 border-b border-light-navy sticky top-0 z-10">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-neon-pink"
          >
            <Activity size={24} />
          </motion.div>
          <h1 className="font-heading text-xl uppercase tracking-wider text-pastel-yellow">
            Crypto Pulse
          </h1>
        </div>

        <nav className="flex items-center gap-4">
          <div className="flex items-center">
            {['historical', 'live', 'profile'].map((tab) => (
              <div
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => onTabChange(tab)}
                role="button"
                tabIndex={0}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>

          {currentUser && (
            <div className="flex items-center gap-3 ml-4">
              <img 
                src={currentUser.photoURL || ''} 
                alt="Profile" 
                className="h-8 w-8 rounded-full border border-neon-pink"
              />
              <button 
                onClick={signOut} 
                className="text-pastel-yellow opacity-70 hover:opacity-100 transition-opacity"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;