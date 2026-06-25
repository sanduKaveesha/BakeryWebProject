// ===================================================
// CartItemRepository.java  — com.bakery.repository
// ===================================================
package com.bakery.repository;

import com.bakery.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // All items in a specific cart
    List<CartItem> findByCartId(Long cartId);

    // Look up an existing line for the same cart + product (to update qty)
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    // Remove all items from a cart (used on checkout / clear-cart)
    void deleteAllByCartId(Long cartId);
}
