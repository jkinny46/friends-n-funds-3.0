'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GameDetailsModal({ game, onClose }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (game) {
      fetchParticipants();
    }
  }, [game]);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('game_participants')
        .select(`
          *,
          user:users!user_id(wallet_address, username)
        `)
        .eq('game_id', game.id);

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!game) return null;

  const estimatedYield = (parseFloat(game.total_pot) * 0.1).toFixed(4); // 10% estimate
  const daysRemaining = game.status === 'active' 
    ? Math.ceil((new Date(game.end_time) - new Date()) / (1000 * 60 * 60 * 24))
    : game.duration_seconds / 86400;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{game.name}</h2>
            <p className="text-gray-600">Status: <span className="font-medium capitalize">{game.status}</span></p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Invite Code Section */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">Invite Code</h3>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-mono font-bold text-purple-600">{game.invite_code}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(game.invite_code);
                alert('Invite code copied!');
              }}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Copy
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">Share this code with friends to join</p>
        </div>

        {/* Game Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Deposit Amount</p>
            <p className="text-xl font-bold">{game.deposit_amount} ETH</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Pot</p>
            <p className="text-xl font-bold">{game.total_pot} ETH</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Est. Yield (10% APY)</p>
            <p className="text-xl font-bold text-green-600">+{estimatedYield} ETH</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Duration</p>
            <p className="text-xl font-bold">{daysRemaining} days</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Players</p>
            <p className="text-xl font-bold">{game.current_participants}/{game.max_participants}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Winner Selection</p>
            <p className="text-xl font-bold capitalize">{game.winner_selection}</p>
          </div>
        </div>

        {/* Participants Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Participants</h3>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {participants.map((participant, index) => (
                <div key={participant.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{participant.user?.username || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">
                        {participant.user?.wallet_address?.slice(0, 6)}...{participant.user?.wallet_address?.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{participant.deposit_amount} ETH</p>
                    <p className="text-xs text-gray-600">Deposited</p>
                  </div>
                </div>
              ))}
              {game.current_participants < game.max_participants && (
                <div className="text-center py-4 text-gray-500">
                  <p>{game.max_participants - game.current_participants} spots remaining</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              const shareText = `Join my yield game "${game.name}"!\n\nDeposit: ${game.deposit_amount} ETH\nInvite Code: ${game.invite_code}\n\nLet's earn yield together!`;
              if (navigator.share) {
                navigator.share({
                  title: `Join ${game.name}`,
                  text: shareText,
                });
              } else {
                navigator.clipboard.writeText(shareText);
                alert('Game details copied to clipboard!');
              }
            }}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Share Game
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
