'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/lib/supabase';

export default function CreateGameForm({ onGameCreated }) {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdGameCode, setCreatedGameCode] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    depositAmount: '',
    duration: '86400',
    maxParticipants: '5',
    winnerSelection: 'random',
  });

  // Generate a random 6-character invite code
  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedGameCode(null);
    
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
            id: crypto.randomUUID(),
            wallet_address: address.toLowerCase(),
            username: `Player${address.slice(-4)}`
          }])
          .select()
          .single();
          
        if (userError) throw userError;
        userId = newUser.id;
      }
      
      // Generate unique invite code
      let inviteCode;
      let codeIsUnique = false;
      
      while (!codeIsUnique) {
        inviteCode = generateInviteCode();
        const { data: existingGame } = await supabase
          .from('games')
          .select('id')
          .eq('invite_code', inviteCode)
          .single();
          
        if (!existingGame) {
          codeIsUnique = true;
        }
      }
      
      // Now create the game with invite code
      const gameData = {
        name: formData.name,
        creator_id: userId,
        deposit_amount: parseFloat(formData.depositAmount),
        max_participants: parseInt(formData.maxParticipants),
        duration_seconds: parseInt(formData.duration),
        winner_selection: formData.winnerSelection,
        chain_id: 11155111,
        status: 'pending',
        current_participants: 1,
        total_pot: parseFloat(formData.depositAmount),
        invite_code: inviteCode
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
          transaction_hash: `0x${Date.now().toString(16)}`
        }]);
        
      if (participantError) {
        console.error('Participant creation error:', participantError);
      }
      
      // Set the created game code to show to user
      setCreatedGameCode(inviteCode);
      
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <p className="text-gray-600 text-center">Please connect your wallet first</p>
      </div>
    );
  }

  // Show success message with invite code
  if (createdGameCode) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Game Created Successfully!</h3>
        <p className="text-gray-600 mb-6">Share this invite code with your friends:</p>
        <div className="bg-white border-2 border-green-500 rounded-lg p-6 mb-6">
          <p className="text-4xl font-mono font-bold text-green-600">{createdGameCode}</p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(createdGameCode);
            alert('Invite code copied to clipboard!');
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Copy Code
        </button>
        <button
          onClick={() => setCreatedGameCode(null)}
          className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Create Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          Error: {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Game Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            placeholder="Friday Night Stakes"
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Deposit Amount (ETH)</label>
          <input
            type="number"
            name="depositAmount"
            value={formData.depositAmount}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            placeholder="0.1"
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Duration</label>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            disabled={loading}
          >
            <option value="86400">1 Day</option>
            <option value="604800">1 Week</option>
            <option value="2592000">30 Days</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Max Participants</label>
          <input
            type="number"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            min="2"
            max="10"
            className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Winner Selection</label>
          <select
            name="winnerSelection"
            value={formData.winnerSelection}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            disabled={loading}
          >
            <option value="random">Random</option>
            <option value="vote">Group Vote</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg'
          }`}
        >
          {loading ? 'Creating...' : 'Create Game'}
        </button>
      </div>
    </form>
  );
}
