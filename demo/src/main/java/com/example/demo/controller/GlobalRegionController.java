package com.example.demo.controller;

import com.example.demo.service.GlobalRegionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/global/topdecks")
public class GlobalRegionController {

    private final GlobalRegionService globalRegionService;

    public GlobalRegionController(GlobalRegionService globalRegionService) {
        this.globalRegionService = globalRegionService;
    }

    // 🔹 Inicia a coleta global
    @GetMapping("/start")
    public ResponseEntity<String> startGlobalCollection() {
        try {
            globalRegionService.startGlobalCollection();
            return ResponseEntity.ok("🚀 Coleta global iniciada com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Erro: " + e.getMessage());
        }
    }

    // 🔹 Consulta status da coleta
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getGlobalStatus() {
        return ResponseEntity.ok(globalRegionService.getStatus());
    }
    @GetMapping("/data")
    public ResponseEntity<?> getGlobalDecks() {
        Map<String, Object> allData = globalRegionService.getAggregatedData();

        // só envia os top 20 de cada categoria
        List<Map<String, Object>> stable = ((List<Map<String, Object>>) allData.get("stable"))
                .stream().limit(20).toList();
        List<Map<String, Object>> trending = ((List<Map<String, Object>>) allData.get("trending"))
                .stream().limit(20).toList();

        Map<String, Object> trimmed = Map.of(
            "summary", allData.get("summary"),
            "stable", stable,
            "trending", trending
        );

        return ResponseEntity.ok(trimmed);
    }


}
