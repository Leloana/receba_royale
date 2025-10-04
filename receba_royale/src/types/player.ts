// src/types/player.ts

export interface Card {
  name: string;
  elixirCost: number;
  iconUrl: string;
}

export interface Deck {
  cards: Card[];
  games: number;
  wins: number;
  winrate: number;
}

export interface PlayerStats {
  playerTag: string;
  totalBattles: number;
  wins: number;
  overallWinrate: number;
  decks: Deck[];
}
