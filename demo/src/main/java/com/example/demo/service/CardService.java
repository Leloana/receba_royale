package com.example.demo.service;

import com.example.demo.client.RoyaleApiClient;
import org.springframework.stereotype.Service;

@Service
public class CardService {

    private final RoyaleApiClient royaleApiClient;

    public CardService(RoyaleApiClient royaleApiClient) {
        this.royaleApiClient = royaleApiClient;
    }

    public String fetchAllCards() {
        return royaleApiClient.getCards();
    }
}
