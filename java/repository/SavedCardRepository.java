package com.bakery.repository;

import com.bakery.model.SavedCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SavedCardRepository extends JpaRepository<SavedCard, Long> {
    List<SavedCard> findByUserId(Long userId);
}