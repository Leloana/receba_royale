package com.example.demo.service;

import com.example.demo.client.RoyaleApiClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.io.File;

@Service
public class GlobalRegionService {

    private final RoyaleApiClient royaleApiClient;
    private final ObjectMapper mapper = new ObjectMapper();

    private final ExecutorService playerExecutor = Executors.newFixedThreadPool(100); // controla jogadores

    // Cache e progresso
    private final Map<String, Integer> deckWins = new ConcurrentHashMap<>();
    private final Map<String, Integer> deckGames = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> deckCards = new ConcurrentHashMap<>();
    private final Set<Integer> processedRegions = ConcurrentHashMap.newKeySet();

    private volatile boolean running = false;
    private volatile Instant startTime;

    public GlobalRegionService(RoyaleApiClient royaleApiClient) {
        this.royaleApiClient = royaleApiClient;
    }

    private void loadProgress() {
        try {
            File file = new File("globalCache.json");
            if (file.exists()) {
                JsonNode json = mapper.readTree(file);
                json.get("processedRegions").forEach(r -> processedRegions.add(r.asInt()));

                json.get("deckWins").fields().forEachRemaining(e ->
                    deckWins.put(e.getKey(), e.getValue().asInt())
                );
                json.get("deckGames").fields().forEachRemaining(e ->
                    deckGames.put(e.getKey(), e.getValue().asInt())
                );

                json.get("deckCards").fields().forEachRemaining(e -> {
                    try {
                        List<Map<String, Object>> cards =
                            mapper.convertValue(e.getValue(), List.class);
                        deckCards.put(e.getKey(), cards);
                    } catch (Exception ignored) {}
                });

                System.out.println("📂 Cache carregado com sucesso (" + processedRegions.size() + " regiões)");
            }
        } catch (Exception e) {
            System.err.println("Erro ao carregar cache: " + e.getMessage());
        }
    }


    // 🔹 Inicia ou reinicia a coleta global
    public synchronized void startGlobalCollection() {
        if (running) {
            throw new RuntimeException("Já existe uma coleta em andamento!");
        }
        loadProgress();
        running = true;
        startTime = Instant.now();

        CompletableFuture.runAsync(() -> {
            try {
                runGlobalCollection();
            } finally {
                running = false;
            }
        });
    }

    private void runGlobalCollection() {
        int regionCount = 0;

        for (int locationId = 57000007; locationId <= 57000260; locationId++) {
            if (processedRegions.contains(locationId)) continue;

            try {
                processRegion(locationId);
                processedRegions.add(locationId);
                regionCount++;

                // ✅ salva a cada 10 regiões
                if (regionCount % 10 == 0) saveProgress();

                // ✅ aguarda um pouco entre regiões para não sobrecarregar a API
                Thread.sleep(1500);

            } catch (Exception e) {
                if (e.getMessage() != null && e.getMessage().contains("429")) {
                    System.err.println("⚠️ Limite atingido, aguardando 30 segundos...");
                    try { Thread.sleep(30000); } catch (InterruptedException ignored) {}
                } else {
                    System.err.println("❌ Erro na região " + locationId + ": " + e.getMessage());
                }
            }
        }

        saveProgress();
        System.out.println("✅ Coleta global concluída!");
    }


    private void saveProgress() {
        try {
            Map<String, Object> snapshot = Map.of(
                "processedRegions", processedRegions,
                "deckWins", deckWins,
                "deckGames", deckGames,
                "deckCards", deckCards
            );
            mapper.writeValue(new File("globalCache.json"), snapshot);
            System.out.println("💾 Progresso salvo.");
        } catch (Exception e) {
            System.err.println("Erro ao salvar cache: " + e.getMessage());
        }
    }



    // 🔹 Processa uma única região
    private void processRegion(int locationId) {
        try {
            String response = royaleApiClient.getTopPlayersByLocation(String.valueOf(locationId));
            JsonNode playersNode = mapper.readTree(response).get("items");

            if (playersNode == null || !playersNode.isArray() || playersNode.isEmpty()) {
                System.out.println("📭 Região " + locationId + " sem jogadores.");
                return;
            }

            System.out.println("🌍 Processando região " + locationId + " (" + playersNode.size() + " jogadores)");

            ExecutorService playerExecutor = Executors.newFixedThreadPool(20);
            List<CompletableFuture<Void>> tasks = new ArrayList<>();

            for (JsonNode player : playersNode) {
                String tag = player.get("tag").asText();

                CompletableFuture<Void> task = CompletableFuture.runAsync(() -> {
                    try {
                        JsonNode battles = royaleApiClient.getBattleLog(tag);
                        handlePlayerBattles(battles);
                        Thread.sleep(100); // leve pausa entre jogadores (~10/s)
                    } catch (WebClientResponseException.TooManyRequests e) {
                        System.err.println("429 em jogador " + tag + " (região " + locationId + ")");
                        try { Thread.sleep(30000); } catch (InterruptedException ignored) {}
                    } catch (Exception e) {
                        System.err.println("Erro jogador " + tag + ": " + e.getMessage());
                    }
                }, playerExecutor);

                tasks.add(task);
            }

            CompletableFuture.allOf(tasks.toArray(new CompletableFuture[0])).join();
            playerExecutor.shutdown();

            System.out.println("✅ Região " + locationId + " concluída!");

        } catch (Exception e) {
            System.err.println("Erro processando região " + locationId + ": " + e.getMessage());
        }
    }


    // 🔹 Processa todas as batalhas de um jogador
    private void handlePlayerBattles(JsonNode battles) {
        for (JsonNode battle : battles) {
            if (!battle.has("team") || !battle.has("opponent") || !battle.has("gameMode")) continue;

            // 🎯 Filtra apenas modos competitivos válidos (Ladder e Ranked1v1)
            int modeId = battle.get("gameMode").get("id").asInt();
            if (modeId != 72000006 && modeId != 72000464) {
                continue; // ignora outros modos (ex: desafios, torneios, amistosos)
            }

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

            // 🔑 Cria identificador único do deck
            Collections.sort(cardNames);
            String deckKey = String.join(",", cardNames);

            synchronized (deckGames) {
                deckCards.putIfAbsent(deckKey, cards);
                deckGames.put(deckKey, deckGames.getOrDefault(deckKey, 0) + 1);
                if (win) deckWins.put(deckKey, deckWins.getOrDefault(deckKey, 0) + 1);
            }
        }
    }


    // 🔹 Retorna status atual (para /status)
    public Map<String, Object> getStatus() {
        int totalRegions = 57000260 - 57000007 + 1;
        int processed = processedRegions.size();
        double progress = (processed / (double) totalRegions) * 100.0;

        int totalGames = deckGames.values().stream().mapToInt(Integer::intValue).sum();
        int totalWins = deckWins.values().stream().mapToInt(Integer::intValue).sum();

        Duration elapsed = startTime != null ? Duration.between(startTime, Instant.now()) : Duration.ZERO;

        return Map.of(
                "running", running,
                "progressPercent", progress,
                "regionsProcessed", processed,
                "totalRegions", totalRegions,
                "totalGames", totalGames,
                "totalWins", totalWins,
                "elapsedSeconds", elapsed.toSeconds()
        );
    }

    public Map<String, Object> getAggregatedData() {
        try {
            File file = new File("globalCache.json");
            if (!file.exists()) {
                throw new RuntimeException("Cache global não encontrado. Execute a coleta primeiro.");
            }

            JsonNode json = mapper.readTree(file);

            Map<String, Integer> deckWins = new HashMap<>();
            Map<String, Integer> deckGames = new HashMap<>();
            Map<String, List<Map<String, Object>>> deckCards = new HashMap<>();

            json.get("deckWins").fields().forEachRemaining(e ->
                deckWins.put(e.getKey(), e.getValue().asInt())
            );

            json.get("deckGames").fields().forEachRemaining(e ->
                deckGames.put(e.getKey(), e.getValue().asInt())
            );

            json.get("deckCards").fields().forEachRemaining(e -> {
                try {
                    List<Map<String, Object>> cards =
                        mapper.convertValue(e.getValue(), List.class);
                    deckCards.put(e.getKey(), cards);
                } catch (Exception ignored) {}
            });

            // 📊 Recalcula estatísticas agregadas
            int totalWins = deckWins.values().stream().mapToInt(Integer::intValue).sum();
            int totalGames = deckGames.values().stream().mapToInt(Integer::intValue).sum();
            double p0 = totalGames > 0 ? totalWins / (double) totalGames : 0.5;

            int MIN_TRENDING = 50;
            int MIN_STABLE = 200;
            double Z95 = 1.96;
            int W_PRIOR = 200;

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
                    (a,b) -> Double.compare((double)b.get("wilsonLB"), (double)a.get("wilsonLB"));

            stable.sort(byWilsonDesc);
            trending.sort(byWilsonDesc);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("summary", Map.of(
                    "globalMeanWinrate", p0 * 100.0,
                    "totalGames", totalGames
            ));
            result.put("stable", stable);
            result.put("trending", trending);

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar cache global: " + e.getMessage(), e);
        }
    }


    // =============================
    // 🔹 Estatísticas (opcional)
    // =============================
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
