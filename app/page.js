'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HomeTab from '@/components/HomeTab';
import GameActionsTab from '@/components/GameActionsTab';
import { useAccount } from 'wagmi';

const mockGames = [
  {
    id: 1,
    name: 'Weekend Warriors',
    depositAmount: '0.1',
    duration: '7 days',
    participants: 5,
    maxParticipants: 5,
    status: 'active',
    creator: '0x1234...5678',
  },
  {
    id: 2,
    name: 'Monthly Madness',
    depositAmount: '0.5',
    duration: '30 days',
    participants: 2,
    maxParticipants: 10,
    status: 'pending',
    creator: '0xabcd...efgh',
  },
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const [games, setGames] = useState(mockGames);
  const [activeTab, setActiveTab] = useState('home');
  const [userStats, setUserStats] = useState({
    totalDeposited: '0',
    potentialWinnings: '0.00',
    activeGames: 0,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="text-center bg-white rounded-2xl shadow-lg p-12 mt-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Connect Your Wallet to Get Started
            </h2>
            <p className="text-gray-600 text-lg">
              Join games, earn yield, and compete with friends!
            </p>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm mb-8 p-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                    activeTab === 'home'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🏠 Home
                </button>
                <button
                  onClick={() => setActiveTab('actions')}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                    activeTab === 'actions'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🎮 Game Actions
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'home' ? (
              <HomeTab games={games} userStats={userStats} />
            ) : (
              <GameActionsTab 
                games={games} 
                onGameCreated={(game) => setGames([...games, game])}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
