package com.example.demo.client;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.concurrent.CompletableFuture;

@Service
public class RoyaleApiClient {

    private final WebClient webClient;

    public RoyaleApiClient(WebClient royaleWebClient) {
        this.webClient = royaleWebClient;
    }

    public String getCards() {
        return webClient.get()
                .uri("cards")
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    public JsonNode getBattleLog(String playerTag) {
        String response = webClient.get()
                .uri("players/{playerTag}/battlelog", playerTag)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        try {
            return new ObjectMapper().readTree(response);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao parsear JSON: " + e.getMessage());
        }
    }


    public String getTopPlayersByLocation(String locationId) {
        return webClient.get()
                .uri("locations/{locationId}/pathoflegend/players", locationId)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    public CompletableFuture<JsonNode> getBattleLogAsync(String playerTag) {
    return webClient.get()
            .uri("players/{playerTag}/battlelog", playerTag)
            .retrieve()
            .bodyToMono(String.class)
            .map(body -> {
                try {
                    return new ObjectMapper().readTree(body);
                } catch (Exception e) {
                    throw new RuntimeException("Erro parseando JSON do jogador " + playerTag, e);
                }
            })
            .toFuture();
    }

}
