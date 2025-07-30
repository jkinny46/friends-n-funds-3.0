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
