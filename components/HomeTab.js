'use client';

import { useNetwork, useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import GameDetailsModal from './GameDetailsModal';

export default function HomeTab({ games, userStats, onRefresh }) {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const [userGames, setUserGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  
  useEffect(() => {
    if (address && games.length > 0) {
      fetchUserGames();
    }
  }, [address, games]);

  const fetchUserGames = async () => {
    try {
      // Get user record
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .single();

      if (!userData) {
        setUserGames([]);
        return;
      }

      // Get games where user is a participant
      const { data: participations } = await supabase
        .from('game_participants')
        .select(`
          *,
          games(*)
        `)
        .eq('user_id', userData.id);

      const activeUserGames = participations
        ?.filter(p => p.games && (p.games.status === 'active' || p.games.status === 'pending'))
        .map(p => p.games) || [];

      console.log('User games:', activeUserGames);
      setUserGames(activeUserGames);
    } catch (error) {
      console.error('Error fetching user games:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate platform stats from games
  const platformStats = {
    totalDeposited: games.reduce((sum, game) => 
      sum + (parseFloat(game.deposit_amount || 0) * (game.current_participants || 0)), 0
    ).toFixed(2),
    activeGames: games.filter(g => g.status === 'active').length,
    totalPlayers: games.reduce((sum, game) => sum + (game.current_participants || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Game Details Modal */}
      {selectedGame && (
        <GameDetailsModal 
          game={selectedGame} 
          onClose={() => setSelectedGame(null)} 
        />
      )}

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Active Games</h2>
            <p className="text-gray-600">Compete for yield with friends!</p>
          </div>
          <button 
            onClick={onRefresh}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
        
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
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : userGames.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl mb-2">No active games yet!</p>
              <p>Go to Actions tab to create your first game</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userGames.map(game => (
                <div key={game.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{game.name}</h4>
                      <p className="text-sm text-gray-600">
                        {game.current_participants}/{game.max_participants} players • {game.deposit_amount} ETH
                      </p>
                      <p className="text-xs text-gray-500">
                        Status: <span className="font-medium capitalize">{game.status}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedGame(game)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
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
