export type ClanWarClan = {
  crowns?: number;
  tag?: string;
  clanScore?: number;
  badgeId?: number;
  name?: string;
  participants?: number;
  battlesPlayed?: number;
  wins?: number;
};

export type ClanWarStanding = {
  trophyChange?: number;
  clan?: ClanWarClan;
};

export type ClanWarParticipant = {
  tag?: string;
  name?: string;
  cardsEarned?: number;
  battlesPlayed?: number;
  wins?: number;
  collectionDayBattlesPlayed?: number;
  numberOfBattles?: number;
};

export type ClanWarLogEntry = {
  standings?: ClanWarStanding[];
  seasonId?: number;
  participants?: ClanWarParticipant[];
  createdDate?: string;
};

export type ClanWarLogResponse = ClanWarLogEntry[];
