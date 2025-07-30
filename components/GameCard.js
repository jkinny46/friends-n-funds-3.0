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
