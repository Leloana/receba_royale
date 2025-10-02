import { api } from "../api";
import type { ClanWarLogResponse } from "../../types/clanWarLog";

export async function getClanWarLog(
  clanTag: string,
  options?: {
    limit?: number;
    after?: string;
    before?: string;
  }
) {
  try {
    // Garantir que a tag tenha o formato correto
    const formattedTag = clanTag.startsWith('#') ? clanTag : `#${clanTag}`;
    
    // Build query params if necessary
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.after) params.append('after', options.after);
    if (options?.before) params.append('before', options.before);
    
    const queryString = params.toString();
    const endpoint = `/clans/${encodeURIComponent(formattedTag)}/warlog${queryString ? `?${queryString}` : ''}`;
    
    console.log('Making request to:', endpoint);
    
    const response = await api.get<ClanWarLogResponse>(endpoint);
    
    const rate = {
      remaining: Number(response.headers["x-ratelimit-remaining"] ?? ""),
      reset: Number(response.headers["x-ratelimit-reset"] ?? ""),
    };
    
    return { data: response.data, rate };
  } catch (error) {
    console.error('Error in clan war log request:', error);
    throw error;
  }
}
