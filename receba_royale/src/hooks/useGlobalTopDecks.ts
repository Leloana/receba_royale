import { useEffect, useState } from "react";
import api from "../api/api";

interface DeckCard {
  name: string;
  iconUrl: string;
  elixirCost: number;
}

interface DeckData {
  cards: DeckCard[];
  games: number;
  wins: number;
  winrate: number;
}

interface GlobalStatus {
  running: boolean;
  progressPercent: number;
  regionsProcessed: number;
  totalRegions: number;
  totalGames: number;
  totalWins: number;
  elapsedSeconds: number;
  stable?: DeckData[];
  trending?: DeckData[];
}

export function useGlobalTopDecks() {
  const [status, setStatus] = useState<GlobalStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await api.get<GlobalStatus>("/global/topdecks/status");
      setStatus(res.data);
    } catch (err) {
      console.error("Erro ao buscar status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // atualiza a cada 5 s
    return () => clearInterval(interval);
  }, []);

  const startCollection = async () => {
    await api.get("/global/topdecks/start");
    await fetchStatus();
  };

  return { status, loading, startCollection };
}
