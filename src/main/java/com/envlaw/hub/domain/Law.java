package com.envlaw.hub.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity @Getter @Setter
public class Law {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String category; // domestic-climate, global-eu 등
    private String title;    // 법안 명칭

    @Column(columnDefinition = "LONGTEXT")
    private String content;  // 한국어 요약 설명

    @Column(columnDefinition = "LONGTEXT")
    private String originalText; // 원문 (영어, 일어, 중어 등)

    private String country;  // KR, EU, USA, JP, CN
}