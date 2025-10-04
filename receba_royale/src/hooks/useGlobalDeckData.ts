// src/hooks/useGlobalDeckData.ts
import { useState, useEffect } from "react";
import api from "../api/api";

export function useGlobalDeckData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/global/topdecks/data")
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
