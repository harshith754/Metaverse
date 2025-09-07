import { useCallback } from 'react';
import type { PlayerInfo } from '@/features/player/types';

interface UsePlayerUpdatesProps {
  setOnlinePlayers: React.Dispatch<React.SetStateAction<PlayerInfo[]>>;
}

export const usePlayerUpdates = ({ setOnlinePlayers }: UsePlayerUpdatesProps) => {
  const handleUpdatePlayers = useCallback((players: Record<string, { x: number; y: number; name: string }>) => {
    const playersList = Object.entries(players).map(([id, { name }]) => ({ id, name }));
    setOnlinePlayers(playersList);
  }, [setOnlinePlayers]);

  return { handleUpdatePlayers };
};