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
