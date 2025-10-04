export type IconUrls = {
  medium?: string;
  small?: string;
  large?: string;
  [k: string]: string | undefined;
};

export type JsonLocalizedName = Record<string, string>; 

export type Card = {
  id: number;
  name: JsonLocalizedName | string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary" | "Champion" | string;
  maxLevel: number;
  elixirCost?: number | null;
  maxEvolutionLevel?: number | null;
  iconUrls?: IconUrls;
};

export type CardsResponse = {
  items: Card[];
  supportItems: Card[];
};
