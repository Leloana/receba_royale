// src/hooks/usePlayerStats.ts
import { useState, useEffect } from "react";
import api from "../api/api";
import type { PlayerStats } from "../types/player";

export function usePlayerStats(playerTag: string) {
  const [data, setData] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerTag) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const encodedTag = encodeURIComponent(playerTag); // transforma # em %23
        const res = await api.get<PlayerStats>(`/players/${encodedTag}/battlelog`);
        setData(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerTag]);

  return { data, loading, error };
}
