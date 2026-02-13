package com.envlaw.hub.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
public class GeminiController {

    @Value("${gemini.api.key}")
    private String apiKey;

    // v1beta가 현재 gemini-1.5-flash 모델에 가장 안정적입니다.
    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        RestTemplate restTemplate = new RestTemplate();

        // 1. 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 2. 구글이 요구하는 복잡한 JSON 구조 생성
        Map<String, Object> textPart = Map.of("text", request.getPrompt()); // JS의 prompt와 매칭
        Map<String, Object> parts = Map.of("parts", List.of(textPart));
        Map<String, Object> contents = Map.of("contents", List.of(parts));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contents, headers);

        try {
            // 3. 구글 서버 호출
            ResponseEntity<Map> response = restTemplate.postForEntity(GEMINI_API_URL + apiKey, entity, Map.class);

            // 4. 응답 데이터 추출 (candidates -> content -> parts -> text)
            List candidates = (List) response.getBody().get("candidates");
            Map firstCandidate = (Map) candidates.get(0);
            Map content = (Map) firstCandidate.get("content");
            List resParts = (List) content.get("parts");
            String aiAnswer = (String) ((Map) resParts.get(0)).get("text");

            return ResponseEntity.ok(new ChatResponse(aiAnswer));

        } catch (Exception e) {
            System.err.println("API 호출 에러: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ChatResponse("AI 서버 응답 실패: " + e.getMessage()));
        }
    }
}