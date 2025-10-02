import { api } from "../api";

export interface ClanInfo {
  tag: string;
  name: string;
  description: string;
  type: string;
  badgeId: number;
  clanScore: number;
  clanWarTrophies: number;
  location?: {
    id: number;
    name: string;
    isCountry: boolean;
    countryCode: string;
  };
  requiredTrophies: number;
  donationsPerWeek: number;
  memberCount: number;
  members: Array<{
    tag: string;
    name: string;
    role: string;
    lastSeen: string;
    expLevel: number;
    trophies: number;
    arena: {
      id: number;
      name: string;
    };
    clanRank: number;
    previousClanRank: number;
    donations: number;
    donationsReceived: number;
    clanChestPoints: number;
  }>;
}

export interface CurrentWar {
  state: string;
  warEndTime: string;
  clan: {
    tag: string;
    name: string;
    badgeId: number;
    clanScore: number;
    participants: number;
    battlesPlayed: number;
    wins: number;
    crowns: number;
  };
  participants: Array<{
    tag: string;
    name: string;
    cardsEarned: number;
    battlesPlayed: number;
    wins: number;
    collectionDayBattlesPlayed: number;
  }>;
}

export interface RiverRaceLog {
  items: Array<{
    seasonId: number;
    sectionIndex: number;
    createdDate: string;
    standings: Array<{
      rank: number;
      trophyChange: number;
      clan: {
        tag: string;
        name: string;
        badgeId: number;
      };
    }>;
  }>;
}

export async function getClanInfo(clanTag: string) {
  try {
    const formattedTag = clanTag.startsWith('#') ? clanTag : `#${clanTag}`;
    const endpoint = `/clans/${encodeURIComponent(formattedTag)}`;
    
    console.log('Fetching clan information:', endpoint);
    const response = await api.get<ClanInfo>(endpoint);
    
    const rate = {
      remaining: Number(response.headers["x-ratelimit-remaining"] ?? ""),
      reset: Number(response.headers["x-ratelimit-reset"] ?? ""),
    };
    
    return { data: response.data, rate };
  } catch (error) {
    console.error('Error fetching clan information:', error);
    throw error;
  }
}

export async function getCurrentWar(clanTag: string) {
  try {
    const formattedTag = clanTag.startsWith('#') ? clanTag : `#${clanTag}`;
    const endpoint = `/clans/${encodeURIComponent(formattedTag)}/currentwar`;
    
    console.log('Fetching current war:', endpoint);
    const response = await api.get<CurrentWar>(endpoint);
    
    const rate = {
      remaining: Number(response.headers["x-ratelimit-remaining"] ?? ""),
      reset: Number(response.headers["x-ratelimit-reset"] ?? ""),
    };
    
    return { data: response.data, rate };
  } catch (error) {
    console.error('Error fetching current war:', error);
    throw error;
  }
}

export async function getRiverRaceLog(clanTag: string) {
  try {
    const formattedTag = clanTag.startsWith('#') ? clanTag : `#${clanTag}`;
    const endpoint = `/clans/${encodeURIComponent(formattedTag)}/riverracelog`;
    
    console.log('Fetching river race log:', endpoint);
    const response = await api.get<RiverRaceLog>(endpoint);
    
    const rate = {
      remaining: Number(response.headers["x-ratelimit-remaining"] ?? ""),
      reset: Number(response.headers["x-ratelimit-reset"] ?? ""),
    };
    
    return { data: response.data, rate };
  } catch (error) {
    console.error('Error fetching river race log:', error);
    throw error;
  }
}

export async function getClanWarLog(clanTag: string) {
  try {
    const formattedTag = clanTag.startsWith('#') ? clanTag : `#${clanTag}`;
    const endpoint = `/clans/${encodeURIComponent(formattedTag)}/warlog`;
    
    console.log('Fetching war log:', endpoint);
    const response = await api.get(endpoint);
    
    const rate = {
      remaining: Number(response.headers["x-ratelimit-remaining"] ?? ""),
      reset: Number(response.headers["x-ratelimit-reset"] ?? ""),
    };
    
    return { data: response.data, rate };
  } catch (error) {
    console.error('Error fetching war log:', error);
    throw error;
  }
}