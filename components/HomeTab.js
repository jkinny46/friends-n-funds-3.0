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
