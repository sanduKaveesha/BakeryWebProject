// ===================================================
// CartRepository.java  — com.bakery.repository
// ===================================================
package com.bakery.repository;

import com.bakery.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // Find the active cart for a given user
    Optional<Cart> findByUserId(Long userId);

    // Check existence (used before creating a new cart)
    boolean existsByUserId(Long userId);
}
