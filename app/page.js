'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HomeTab from '@/components/HomeTab';
import GameActionsTab from '@/components/GameActionsTab';
import { useAccount } from 'wagmi';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [games, setGames] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalDeposited: '0',
    potentialWinnings: '0.00',
    activeGames: 0,
  });

  // Fetch games and set up real-time subscription
  useEffect(() => {
    fetchGames();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('games-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games' },
        (payload) => {
          console.log('Game change received:', payload);
          fetchGames(); // Refetch all games when any change occurs
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_participants' },
        (payload) => {
          console.log('Participant change received:', payload);
          fetchGames(); // Refetch when participants change
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update user stats when address or games change
  useEffect(() => {
    if (address && games.length > 0) {
      updateUserStats(games);
    }
  }, [address, games]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      console.log('Fetching games from Supabase...');
      
      const { data: gamesData, error } = await supabase
        .from('games')
        .select(`
          *,
          creator:users!creator_id(wallet_address, username),
          game_participants(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched games:', gamesData);
      setGames(gamesData || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStats = async (allGames) => {
    if (!address) return;
    
    try {
      // Get user record
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .single();

      if (!userData) {
        console.log('No user found for wallet:', address);
        return;
      }

      // Get user's participations
      const { data: participations } = await supabase
        .from('game_participants')
        .select('*, games(*)')
        .eq('user_id', userData.id);

      console.log('User participations:', participations);

      const activeGames = participations?.filter(p => 
        p.games?.status === 'active' || p.games?.status === 'pending'
      ) || [];

      const totalDeposited = activeGames.reduce((sum, p) => 
        sum + parseFloat(p.deposit_amount || 0), 0
      );

      setUserStats({
        totalDeposited: totalDeposited.toFixed(2),
        potentialWinnings: (totalDeposited * 0.1).toFixed(2),
        activeGames: activeGames.length,
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

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
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                {activeTab === 'home' ? (
                  <HomeTab 
                    games={games} 
                    userStats={userStats} 
                    onRefresh={fetchGames}
                  />
                ) : (
                  <GameActionsTab 
                    games={games} 
                    onGameCreated={(game) => {
                      fetchGames(); // Refresh from database
                      setActiveTab('home');
                    }}
                    onRefresh={fetchGames}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
