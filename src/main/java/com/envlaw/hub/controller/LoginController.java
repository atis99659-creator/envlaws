package com.envlaw.hub.controller;

import com.envlaw.hub.domain.Member;
import com.envlaw.hub.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class LoginController {

    private final MemberRepository memberRepository;

    // [로그인]
    @PostMapping("/login")
    public String login(@RequestBody Map<String, String> loginData) {
        String loginId = loginData.get("loginId");
        String password = loginData.get("password");

        return memberRepository.findByLoginId(loginId)
                .filter(m -> m.getPassword().equals(password))
                .map(Member::getName)
                .orElse("fail");
    }

    // [회원가입]
    @PostMapping("/signup")
    public String signup(@RequestBody Member member) {
        // 이미 존재하는 아이디(이메일)인지 확인
        if (memberRepository.findByLoginId(member.getLoginId()).isPresent()) {
            return "duplicate";
        }

        memberRepository.save(member); // DB에 저장
        return "success";
    }
}