import React from 'react';
import { Activity } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="h-16 bg-deep-navy border-b border-grid-line sticky top-0 z-10">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <Activity className="text-neon-pink w-6 h-6 mr-2" />
          <h1 className="font-display text-neon-pink text-lg">CRYPTO PULSE</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            className={`tab-button ${activeTab === 'historical' ? 'active' : ''}`}
            onClick={() => setActiveTab('historical')}
          >
            Historical
          </button>
          <button
            className={`tab-button ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            Live
          </button>
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;