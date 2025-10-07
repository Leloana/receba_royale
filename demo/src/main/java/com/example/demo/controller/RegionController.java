package com.example.demo.controller;

import com.example.demo.service.RegionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/locations")
public class RegionController {

    private final RegionService regionService;

    public RegionController(RegionService regionService) {
        this.regionService = regionService;
    }

    @GetMapping("/{locationId}/topdecks")
    public ResponseEntity<Map<String, Object>> getTopDecks(@PathVariable String locationId) {
        Map<String, Object> data = regionService.getTopDecksByRegion(locationId);
        return ResponseEntity.ok(data);
    }
    
}
