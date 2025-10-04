package com.example.demo.service;

import com.example.demo.client.RoyaleApiClient;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.*;

@Service
public class PlayerService {

    private final RoyaleApiClient royaleApiClient;

    public PlayerService(RoyaleApiClient royaleApiClient) {
        this.royaleApiClient = royaleApiClient;
    }

    public Map<String, Object> getPlayerStats(String playerTag) {
        JsonNode root = royaleApiClient.getBattleLog(playerTag); // ✅ Agora retorna JsonNode direto

        int wins = 0;
        int total = 0;

        try {
            Map<String, Integer> deckWins = new HashMap<>();
            Map<String, Integer> deckTotal = new HashMap<>();
            Map<String, List<Map<String, Object>>> deckCards = new HashMap<>();

            for (JsonNode battle : root) {
                if (!battle.has("team") || !battle.has("opponent")) continue;

                JsonNode team = battle.get("team").get(0);
                JsonNode opponent = battle.get("opponent").get(0);

                int crownsTeam = team.get("crowns").asInt();
                int crownsOpponent = opponent.get("crowns").asInt();

                List<Map<String, Object>> cards = new ArrayList<>();
                List<String> cardNames = new ArrayList<>();

                for (JsonNode card : team.get("cards")) {
                    Map<String, Object> cardData = new LinkedHashMap<>();
                    cardData.put("name", card.get("name").asText());
                    cardData.put("elixirCost", card.has("elixirCost") ? card.get("elixirCost").asInt() : 0);
                    cardData.put("iconUrl", card.get("iconUrls").get("medium").asText());
                    cards.add(cardData);
                    cardNames.add(card.get("name").asText());
                }

                Collections.sort(cardNames);
                String deckKey = String.join(",", cardNames);

                boolean win = crownsTeam > crownsOpponent;

                deckCards.putIfAbsent(deckKey, cards);
                deckTotal.put(deckKey, deckTotal.getOrDefault(deckKey, 0) + 1);
                if (win) {
                    deckWins.put(deckKey, deckWins.getOrDefault(deckKey, 0) + 1);
                    wins++;
                }
                total++;
            }

            // ✅ Calcula winrate por deck
            List<Map<String, Object>> deckStats = new ArrayList<>();
            for (String deckKey : deckTotal.keySet()) {
                int deckWin = deckWins.getOrDefault(deckKey, 0);
                int deckGames = deckTotal.get(deckKey);
                double winrate = (deckWin * 100.0) / deckGames;

                Map<String, Object> deckInfo = new LinkedHashMap<>();
                deckInfo.put("cards", deckCards.get(deckKey));
                deckInfo.put("games", deckGames);
                deckInfo.put("wins", deckWin);
                deckInfo.put("winrate", winrate);
                deckStats.add(deckInfo);
            }

            // Ordena por winrate
            deckStats.sort((a, b) -> Double.compare(
                    (double) b.get("winrate"), (double) a.get("winrate"))
            );

            double totalWinrate = total > 0 ? (wins * 100.0 / total) : 0.0;

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("playerTag", playerTag);
            result.put("totalBattles", total);
            result.put("wins", wins);
            result.put("overallWinrate", totalWinrate);
            result.put("decks", deckStats);

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar o battlelog: " + e.getMessage(), e);
        }
    }
}
