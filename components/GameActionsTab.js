// components/GameActionsTab.js
'use client';

import { useState } from 'react';
import CreateGameForm from './CreateGameForm';
import { useAccount } from 'wagmi';
import { supabase } from '@/lib/supabase';

export default function GameActionsTab({ games, onGameCreated, onRefresh }) {
  const { address } = useAccount();
  const [selectedAction, setSelectedAction] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);

  const handleJoinClick = () => {
    setShowInviteModal(true);
    setInviteCode('');
    setJoinError(null);
  };

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) {
      setJoinError('Please enter an invite code');
      return;
    }

    setJoining(true);
    setJoinError(null);
    
    try {
      // Find game by invite code
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select(`
          *,
          creator:users!creator_id(wallet_address, username),
          game_participants(*)
        `)
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (gameError || !game) {
        throw new Error('Invalid invite code');
      }

      // Check if game is joinable
      if (game.status !== 'pending') {
        throw new Error('This game has already started');
      }

      if (game.current_participants >= game.max_participants) {
        throw new Error('This game is full');
      }

      // Get or create user
      let userId;
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .single();
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert([{
            id: crypto.randomUUID(),
            wallet_address: address.toLowerCase(),
            username: `Player${address.slice(-4)}`
          }])
          .select()
          .single();
          
        if (userError) throw userError;
        userId = newUser.id;
      }
      
      // Check if already participating
      const { data: existingParticipant } = await supabase
        .from('game_participants')
        .select('id')
        .eq('game_id', game.id)
        .eq('user_id', userId)
        .single();
        
      if (existingParticipant) {
        throw new Error('You are already in this game!');
      }
      
      // Add participant
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert([{
          game_id: game.id,
          user_id: userId,
          deposit_amount: game.deposit_amount,
          transaction_hash: `0x${Date.now().toString(16)}` // Temporary
        }]);
        
      if (participantError) throw participantError;
      
      // Update game participant count
      const newParticipantCount = game.current_participants + 1;
      const { error: updateError } = await supabase
        .from('games')
        .update({ 
          current_participants: newParticipantCount,
          status: newParticipantCount === game.max_participants ? 'active' : 'pending'
        })
        .eq('id', game.id);
        
      if (updateError) throw updateError;
      
      // Success!
      setShowInviteModal(false);
      setInviteCode('');
      alert(`Successfully joined "${game.name}"!`);
      if (onRefresh) onRefresh();
      
    } catch (error) {
      console.error('Error joining game:', error);
      setJoinError(error.message);
    } finally {
      setJoining(false);
    }
  };

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
      id: 'claim',
      title: 'Claim Winnings',
      icon: '💰',
      color: 'from-yellow-600 to-yellow-700',
      description: 'Collect your rewards'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Invite Code Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Enter Invite Code</h3>
            <p className="text-gray-600 mb-6">
              Enter the 6-character code shared by your friend
            </p>
            
            {joinError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {joinError}
              </div>
            )}
            
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl font-mono font-bold rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 mb-6"
              disabled={joining}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteCode('');
                  setJoinError(null);
                }}
                disabled={joining}
                className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinWithCode}
                disabled={joining || inviteCode.length !== 6}
                className={`flex-1 py-3 px-4 font-bold rounded-lg transition-colors ${
                  joining || inviteCode.length !== 6
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {joining ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => {
                  if (action.id === 'join') {
                    handleJoinClick();
                  } else {
                    setSelectedAction(action.id);
                  }
                }}
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
               if (onGameCreated) onGameCreated(game);
              }} />
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
