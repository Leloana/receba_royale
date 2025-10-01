// src/hooks/useCards.ts
import { useQuery } from "@tanstack/react-query";
import { getCards } from "../api/endpoints/cards"; 

export function useCards() {
  return useQuery({
    queryKey: ["cards"],
    queryFn: () => getCards().then(r => r.data),
    staleTime: 60_000,
  });
}
