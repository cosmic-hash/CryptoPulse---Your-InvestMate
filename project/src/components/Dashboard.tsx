import React, { useState } from 'react';
import Header from './Header';
import HistoricalTab from './tabs/HistoricalTab';
import LiveStreamTab from './tabs/LiveStreamTab';
import ProfileTab from './tabs/ProfileTab';
import { TabType } from '../types';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('historical');
  
  return (
    <div className="min-h-screen bg-deep-navy retro-grid">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="min-h-[calc(100vh-4rem)]">
        {activeTab === 'historical' && <HistoricalTab />}
        {activeTab === 'live' && <LiveStreamTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>
    </div>
  );
};

export default Dashboard;