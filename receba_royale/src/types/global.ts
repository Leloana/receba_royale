interface CardData {
  name: string;
  iconUrl: string;
  elixirCost: number;
}

export interface DeckData {
  cards: CardData[];
  games: number;
  wins: number;
  winrate: number;
}
