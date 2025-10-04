package com.example.demo.service;

import com.example.demo.client.RoyaleApiClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
public class RegionService {

    private final RoyaleApiClient royaleApiClient;
    private final ObjectMapper mapper = new ObjectMapper();

    // Controla a quantidade de requisições simultâneas (ajuste conforme necessário)
    private final ExecutorService executor = Executors.newFixedThreadPool(20);

    public RegionService(RoyaleApiClient royaleApiClient) {
        this.royaleApiClient = royaleApiClient;
    }

    public Map<String, Object> getTopDecksByRegion(String locationId) {
        try {
            // Busca os top players da região
            String topPlayersJson = royaleApiClient.getTopPlayersByLocation(locationId);
            JsonNode players = mapper.readTree(topPlayersJson).get("items");

            Map<String, Integer> deckWins = new ConcurrentHashMap<>();
            Map<String, Integer> deckGames = new ConcurrentHashMap<>();
            Map<String, List<Map<String, Object>>> deckCards = new ConcurrentHashMap<>();

            List<CompletableFuture<Void>> tasks = new ArrayList<>();

            // 🔁 Requisições paralelas para cada jogador
            for (JsonNode player : players) {
                String tag = player.get("tag").asText();

                CompletableFuture<Void> task = royaleApiClient.getBattleLogAsync(tag)
                        .thenAcceptAsync(battles -> {
                            for (JsonNode battle : battles) {
                                if (!battle.has("team") || !battle.has("opponent")) continue;

                                JsonNode team = battle.get("team").get(0);
                                JsonNode opponent = battle.get("opponent").get(0);

                                int crownsTeam = team.get("crowns").asInt();
                                int crownsOpponent = opponent.get("crowns").asInt();
                                boolean win = crownsTeam > crownsOpponent;

                                List<Map<String, Object>> cards = new ArrayList<>();
                                List<String> cardNames = new ArrayList<>();

                                for (JsonNode card : team.get("cards")) {
                                    Map<String, Object> cardInfo = new LinkedHashMap<>();
                                    cardInfo.put("name", card.get("name").asText());
                                    cardInfo.put("elixirCost", card.has("elixirCost") ? card.get("elixirCost").asInt() : 0);
                                    cardInfo.put("iconUrl", card.get("iconUrls").get("medium").asText());
                                    cards.add(cardInfo);
                                    cardNames.add(card.get("name").asText());
                                }

                                // Ordena alfabeticamente para gerar chave única do deck
                                Collections.sort(cardNames);
                                String deckKey = String.join(",", cardNames);

                                synchronized (deckGames) {
                                    deckCards.putIfAbsent(deckKey, cards);
                                    deckGames.put(deckKey, deckGames.getOrDefault(deckKey, 0) + 1);
                                    if (win) deckWins.put(deckKey, deckWins.getOrDefault(deckKey, 0) + 1);
                                }
                            }
                        }, executor)
                        .exceptionally(ex -> {
                            System.err.println("Erro ao processar jogador " + tag + ": " + ex.getMessage());
                            return null;
                        });

                tasks.add(task);
            }

            // Aguarda todas as requisições terminarem
            CompletableFuture.allOf(tasks.toArray(new CompletableFuture[0])).join();

            // ================================
            // 🔹 Cálculos estatísticos
            // ================================

            int MIN_TRENDING = 50;
            int MIN_STABLE = 200;
            double Z95 = 1.96;

            // média global (para empirical bayes)
            int totalWins = deckWins.values().stream().mapToInt(Integer::intValue).sum();
            int totalGames = deckGames.values().stream().mapToInt(Integer::intValue).sum();
            double p0 = totalGames > 0 ? totalWins / (double) totalGames : 0.5; // fallback 50%
            int W_PRIOR = 200; // “peso” do prior

            List<Map<String, Object>> stable = new ArrayList<>();
            List<Map<String, Object>> trending = new ArrayList<>();

            for (String deckKey : deckGames.keySet()) {
                int games = deckGames.get(deckKey);
                int wins = deckWins.getOrDefault(deckKey, 0);
                double winrate = games > 0 ? (wins * 100.0) / games : 0.0;
                double wilsonLB = wilsonLowerBound(wins, games, Z95) * 100.0;
                double eb = empiricalBayesRate(wins, games, p0, W_PRIOR) * 100.0;

                Map<String, Object> deckData = new LinkedHashMap<>();
                deckData.put("cards", deckCards.get(deckKey));
                deckData.put("games", games);
                deckData.put("wins", wins);
                deckData.put("winrate", winrate);
                deckData.put("wilsonLB", wilsonLB);
                deckData.put("empiricalBayes", eb);

                if (games >= MIN_STABLE) {
                    stable.add(deckData);
                } else if (games >= MIN_TRENDING) {
                    trending.add(deckData);
                }
            }

            Comparator<Map<String, Object>> byWilsonDesc =
                    (a, b) -> Double.compare((double) b.get("wilsonLB"), (double) a.get("wilsonLB"));

            stable.sort(byWilsonDesc);
            trending.sort(byWilsonDesc);

            // ================================
            // 🔹 Resultado final
            // ================================

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("locationId", locationId);
            result.put("summary", Map.of(
                    "globalMeanWinrate", p0 * 100.0,
                    "totalGames", totalGames,
                    "totalDecks", deckGames.size(),
                    "stableCount", stable.size(),
                    "trendingCount", trending.size()
            ));
            result.put("stable", stable);
            result.put("trending", trending);

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Erro ao calcular decks por região: " + e.getMessage(), e);
        }
    }

    // ================================
    // 📈 Funções auxiliares estatísticas
    // ================================

    private static double wilsonLowerBound(int wins, int games, double z) {
        if (games == 0) return 0.0;
        double p = wins / (double) games;
        double z2 = z * z;
        double denom = 1.0 + z2 / games;
        double center = p + z2 / (2.0 * games);
        double margin = z * Math.sqrt((p * (1 - p) + z2 / (4.0 * games)) / games);
        return (center - margin) / denom;
    }

    private static double empiricalBayesRate(int wins, int games, double p0, int w) {
        return (wins + p0 * w) / (games + w);
    }
}
