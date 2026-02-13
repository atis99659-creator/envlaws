package com.envlaw.hub.repository;

import com.envlaw.hub.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    // 아이디로 회원을 찾는 기능 추가
    Optional<Member> findByLoginId(String loginId);
}