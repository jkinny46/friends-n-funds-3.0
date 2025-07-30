# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

# app/favicon.ico

This is a binary file of the type: Binary

# app/globals.css

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: rgb(var(--foreground-rgb));
  background: #f3f4f6;
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: none;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

```

# app/layout.js

```js
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Friends n Funds',
  description: 'Deposit crypto with friends, earn yield together!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

```

# app/page.js

```js
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

```

# app/providers.js

```js
'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  goerli,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, goerli],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Friends n Funds',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a6b8ba4f5b4e4c44b8eb5f7a1b7c2d3e',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export function Providers({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

```

# components/CreateGameForm.js

```js
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/lib/supabase';

export default function CreateGameForm({ onGameCreated }) {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    depositAmount: '',
    duration: '86400',
    maxParticipants: '5',
    winnerSelection: 'random',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // First, check if user exists
      let userId;
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .single();
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create user with a proper UUID
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert([{
            id: crypto.randomUUID(), // Generate a UUID
            wallet_address: address.toLowerCase(),
            username: `Player${address.slice(-4)}`
          }])
          .select()
          .single();
          
        if (userError) throw userError;
        userId = newUser.id;
      }
      
      // Now create the game with the proper user ID
      const gameData = {
        name: formData.name,
        creator_id: userId, // Use the actual user ID
        deposit_amount: parseFloat(formData.depositAmount),
        max_participants: parseInt(formData.maxParticipants),
        duration_seconds: parseInt(formData.duration),
        winner_selection: formData.winnerSelection,
        chain_id: 11155111, // Sepolia testnet
        status: 'pending',
        current_participants: 1,
        total_pot: parseFloat(formData.depositAmount)
      };
      
      console.log('Creating game with data:', gameData);
      
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert([gameData])
        .select()
        .single();
      
      if (gameError) {
        console.error('Game creation error:', gameError);
        throw gameError;
      }
      
      console.log('Game created successfully:', game);
      
      // Also create the first participant entry
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert([{
          game_id: game.id,
          user_id: userId,
          deposit_amount: parseFloat(formData.depositAmount),
          transaction_hash: `0x${Date.now().toString(16)}` // Temporary hash
        }]);
        
      if (participantError) {
        console.error('Participant creation error:', participantError);
      }
      
      // Reset form
      setFormData({
        name: '',
        depositAmount: '',
        duration: '86400',
        maxParticipants: '5',
        winnerSelection: 'random',
      });
      
      // Notify parent component
      if (onGameCreated) onGameCreated(game);
      
      alert(`Game "${game.name}" created successfully! Check Supabase dashboard.`);
      
    } catch (err) {
      console.error('Error in form submission:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!address) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
        <p className="text-white text-center">Please connect your wallet first</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          Error: {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-white mb-2">Game Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white"
            placeholder="Friday Night Stakes"
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-white mb-2">Deposit Amount (ETH)</label>
          <input
            type="number"
            name="depositAmount"
            value={formData.depositAmount}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white"
            placeholder="0.1"
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-white mb-2">Duration</label>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white bg-gray-800"
            disabled={loading}
          >
            <option value="86400">1 Day</option>
            <option value="604800">1 Week</option>
            <option value="2592000">30 Days</option>
          </select>
        </div>
        
        <div>
          <label className="block text-white mb-2">Max Participants</label>
          <input
            type="number"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            min="2"
            max="10"
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white"
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-white mb-2">Winner Selection</label>
          <select
            name="winnerSelection"
            value={formData.winnerSelection}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white bg-gray-800"
            disabled={loading}
          >
            <option value="random">Random</option>
            <option value="vote">Group Vote</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-colors ${
            loading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary/80 text-white'
          }`}
        >
          {loading ? 'Creating...' : 'Create Game'}
        </button>
      </div>
    </form>
  );
}

```

# components/GameActionsTab.js

```js
// components/GameActionsTab.js
'use client';

import { useState } from 'react';
import CreateGameForm from './CreateGameForm';

export default function GameActionsTab({ games, onGameCreated }) {
  const [selectedAction, setSelectedAction] = useState(null);

  const actionButtons = [
    {
      id: 'create',
      title: 'Create New Game',
      icon: '🎮',
      color: 'from-purple-600 to-purple-700',
      description: 'Start a new yield competition'
    },
    {
      id: 'join',
      title: 'Join Game',
      icon: '🎯',
      color: 'from-blue-600 to-blue-700',
      description: 'Join an existing game'
    },
    {
      id: 'view',
      title: 'View My Active Games',
      icon: '👁️',
      color: 'from-green-600 to-green-700',
      description: 'Check your game progress'
    },
    {
      id: 'claim',
      title: 'Claim Winnings',
      icon: '💰',
      color: 'from-yellow-600 to-yellow-700',
      description: 'Collect your rewards'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Action Selection */}
      {!selectedAction && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span>🎮</span> Game Actions
          </h2>
          <p className="text-gray-600 mb-8">Choose an action to get started</p>
          
          <div className="grid gap-4">
            {actionButtons.map((action) => (
              <button
                key={action.id}
                onClick={() => setSelectedAction(action.id)}
                className={`bg-gradient-to-r ${action.color} text-white rounded-xl p-6 text-left hover:shadow-lg transition-all transform hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                      <span className="text-3xl">{action.icon}</span>
                      {action.title}
                    </h3>
                    <p className="text-white/80">{action.description}</p>
                  </div>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Content */}
      {selectedAction && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <button
            onClick={() => setSelectedAction(null)}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Actions
          </button>

          {selectedAction === 'create' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Game</h2>
              <CreateGameForm onGameCreated={(game) => {
                onGameCreated(game);
                setSelectedAction(null);
              }} />
            </div>
          )}

          {selectedAction === 'join' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Join a Game</h2>
              <div className="space-y-4">
                {games.filter(g => g.status === 'pending').map(game => (
                  <div key={game.id} className="border rounded-lg p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{game.name}</h3>
                        <p className="text-gray-600">Created by {game.creator}</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        {game.participants}/{game.maxParticipants} players
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Deposit Required</p>
                        <p className="font-bold">{game.depositAmount} ETH</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-bold">{game.duration}</p>
                      </div>
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                      Join Game
                    </button>
                  </div>
                ))}
                {games.filter(g => g.status === 'pending').length === 0 && (
                  <p className="text-center text-gray-500 py-8">No games available to join</p>
                )}
              </div>
            </div>
          )}

          {selectedAction === 'view' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">My Active Games</h2>
              <div className="space-y-4">
                {games.filter(g => g.status === 'active').map(game => (
                  <div key={game.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{game.name}</h3>
                        <p className="text-gray-600">Duration: {game.duration}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Active
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Your Deposit</p>
                        <p className="font-bold">{game.depositAmount} ETH</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Pot</p>
                        <p className="font-bold">{(parseFloat(game.depositAmount) * game.participants).toFixed(2)} ETH</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Players</p>
                        <p className="font-bold">{game.participants}/{game.maxParticipants}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition-colors">
                        View Details
                      </button>
                      <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 rounded-lg transition-colors">
                        Invite Friends
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedAction === 'claim' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Claim Winnings</h2>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-4">No winnings to claim yet</p>
                <p className="text-sm text-gray-500">Complete games will appear here</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

```

# components/GameCard.js

```js
export default function GameCard({ game }) {
  const statusColors = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    completed: 'bg-gray-500',
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-all">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">{game.name}</h3>
        <span className={`px-3 py-1 rounded-full text-white text-sm ${statusColors[game.status]}`}>
          {game.status}
        </span>
      </div>
      
      <div className="space-y-2 text-white/80">
        <p>Deposit: {game.depositAmount} ETH</p>
        <p>Duration: {game.duration}</p>
        <p>Participants: {game.participants}/{game.maxParticipants}</p>
      </div>
      
      <button className="mt-4 w-full bg-primary hover:bg-primary/80 text-white font-bold py-2 px-4 rounded-lg transition-colors">
        {game.status === 'pending' ? 'Join Game' : 'View Details'}
      </button>
    </div>
  );
}

```

# components/HomeTab.js

```js
// components/HomeTab.js
'use client';

import { useNetwork } from 'wagmi';

export default function HomeTab({ games, userStats }) {
  const { chain } = useNetwork();
  
  // Calculate platform stats from games
  const platformStats = {
    totalDeposited: games.reduce((sum, game) => 
      sum + (parseFloat(game.depositAmount) * game.participants), 0
    ).toFixed(2),
    activeGames: games.filter(g => g.status === 'active').length,
    totalPlayers: games.reduce((sum, game) => sum + game.participants, 0),
  };

  return (
    <div className="space-y-6">
      {/* Deposit Vault Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Deposit to Vault</h2>
        
        <div className="flex gap-4 mb-6">
          <select className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700">
            <option>ETH</option>
            <option>USDC</option>
            <option>DAI</option>
          </select>
          <input
            type="number"
            placeholder="Amount in ETH"
            className="flex-2 px-4 py-3 border border-gray-300 rounded-lg"
            step="0.01"
          />
        </div>
        
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          Deposit
        </button>
        
        {/* Chain and Balance Info */}
        <div className="mt-6 flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">⛓️</span>
            <span className="font-medium">{chain?.name || 'Ethereum'}</span>
          </div>
          <div className="text-right">
            <div className="font-bold">0.02 ETH</div>
            <div className="text-sm text-gray-600">Balance</div>
          </div>
        </div>
      </div>

      {/* Your Active Games Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Active Games</h2>
        <p className="text-gray-600 mb-6">Compete for yield with friends!</p>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-gray-600 mb-2">Total Deposited</h3>
            <p className="text-3xl font-bold">${userStats.totalDeposited}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-gray-600 mb-2">Potential Winnings</h3>
            <p className="text-3xl font-bold">${userStats.potentialWinnings}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-xl font-bold mb-4">Active Games</h3>
          {userStats.activeGames === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl mb-2">No active games yet!</p>
              <p>Go to Actions tab to create your first game</p>
            </div>
          ) : (
            <div className="space-y-4">
              {games.filter(g => g.status === 'active').map(game => (
                <div key={game.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{game.name}</h4>
                      <p className="text-sm text-gray-600">
                        {game.participants}/{game.maxParticipants} players • {game.depositAmount} ETH
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-white/80 mb-2">Total Value Locked</h3>
            <p className="text-3xl font-bold">{platformStats.totalDeposited} ETH</p>
          </div>
          <div>
            <h3 className="text-white/80 mb-2">Active Games</h3>
            <p className="text-3xl font-bold">{platformStats.activeGames}</p>
          </div>
          <div>
            <h3 className="text-white/80 mb-2">Total Players</h3>
            <p className="text-3xl font-bold">{platformStats.totalPlayers}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

```

# components/Navbar.js

```js
// components/Navbar.js
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🎮</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
              Friends n Funds
            </h1>
          </div>
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}

```

# eslint.config.mjs

```mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals")];

export default eslintConfig;

```

# jsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}

```

# lib/supabase.js

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

```

# lib/useAuth.js

```js
'use client';

import { useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { supabase } from './supabase';

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      authenticateUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [isConnected, address]);

  const authenticateUser = async () => {
    try {
      setLoading(true);
      
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address.toLowerCase())
        .single();

      if (existingUser) {
        setUser(existingUser);
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([
            {
              wallet_address: address.toLowerCase(),
              username: `Player${address.slice(-4)}`,
            }
          ])
          .select()
          .single();

        if (error) throw error;
        setUser(newUser);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, refetchUser: authenticateUser };
}

```

# next.config.mjs

```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

```

# package.json

```json
{
  "name": "friends-n-funds3.0",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@rainbow-me/rainbowkit": "^1.3.7",
    "@supabase/supabase-js": "^2.53.0",
    "ethers": "^5.8.0",
    "next": "15.4.5",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "viem": "^1.21.4",
    "wagmi": "^1.4.13"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "15.4.5",
    "tailwindcss": "^4"
  }
}

```

# postcss.config.mjs

```mjs
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;

```

# public/file.svg

This is a file of the type: SVG Image

# public/globe.svg

This is a file of the type: SVG Image

# public/next.svg

This is a file of the type: SVG Image

# public/vercel.svg

This is a file of the type: SVG Image

# public/window.svg

This is a file of the type: SVG Image

# README.md

```md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

# tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
      },
    },
  },
  plugins: [],
}

```

