package com.example.demo.controller;

import com.example.demo.service.PlayerService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@RestController
@RequestMapping("/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping("/{playerTag}/battlelog")
    public ResponseEntity<Map<String, Object>> getPlayerBattleStats(@PathVariable String playerTag) {
        Map<String, Object> stats = playerService.getPlayerStats(playerTag);
        return ResponseEntity.ok(stats);
    }
}
