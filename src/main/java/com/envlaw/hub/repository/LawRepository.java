package com.envlaw.hub.repository;

import com.envlaw.hub.domain.Law;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LawRepository extends JpaRepository<Law, Long> {
    List<Law> findByCategory(String category);
}