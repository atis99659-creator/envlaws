package com.envlaw.hub.controller;

import com.envlaw.hub.domain.Law;
import com.envlaw.hub.repository.LawRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/laws")
public class LawController {
    private final LawRepository lawRepository;

    @GetMapping("/{category}")
    public List<Law> getLawsByCategory(@PathVariable String category) {
        return lawRepository.findByCategory(category);
    }
}