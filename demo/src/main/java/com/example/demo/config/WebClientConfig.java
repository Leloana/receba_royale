package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.ExchangeStrategies;

@Configuration
public class WebClientConfig {

    @Value("${royale.api.token}")
    private String apiToken;

    @Bean
    public WebClient royaleWebClient() {
    return WebClient.builder()
            .baseUrl("https://proxy.royaleapi.dev/v1/")
            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiToken)
            // ✅ aumenta o buffer de resposta para 5 MB
            .exchangeStrategies(ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(5 * 1024 * 1024))
                .build())
            .build();
    }
}
