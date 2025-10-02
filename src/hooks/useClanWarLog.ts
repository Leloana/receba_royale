import { useQuery } from "@tanstack/react-query";
import { getClanWarLog } from "../api/endpoints/clanWarLog";

export function useClanWarLog(
  clanTag: string,
  options?: {
    limit?: number;
    after?: string;
    before?: string;
  }
) {
  return useQuery({
    queryKey: ["clanWarLog", clanTag, options],
    queryFn: () => getClanWarLog(clanTag, options).then(r => r.data),
    enabled: !!clanTag,
    staleTime: 60_000,
  });
}
