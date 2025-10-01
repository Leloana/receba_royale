// src/api/endpoints/cards.ts
import { api } from "../api";
import type { CardsResponse } from "../../types/cards";

export async function getCards() {
  const res = await api.get<CardsResponse>("/cards");
  // Rate limit (se quiser usar):
  const rate = {
    remaining: Number(res.headers["x-ratelimit-remaining"] ?? ""),
    reset: Number(res.headers["x-ratelimit-reset"] ?? ""),
  };
  return { data: res.data, rate };
}
