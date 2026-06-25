package com.bakery.service;

import com.bakery.model.Cart;
import com.bakery.model.CartItem;
import com.bakery.model.Product;
import com.bakery.model.User;
import com.bakery.repository.CartRepository;
import com.bakery.repository.ProductRepository;
import com.bakery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    // Fetch or create an active cart for a specific user ID
    public Cart getOrCreateCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Look for existing cart; if none exists, instantiate a new one
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    // Add an item to the cart using User ID
    @Transactional
    public Cart addItemToCart(Long userId, Long productId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if item is already present in the cart
        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            // Update quantity increment
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            // Map a brand-new item row
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cart.getCartItems().add(newItem);
        }

        return cartRepository.save(cart);
    }

    // Clear the cart entirely (To be used after checkout finishes processing)
    @Transactional
    public void clearCart(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getCartItems().clear(); // Triggers orphanRemoval = true to wipe DB records
            cartRepository.save(cart);
        });
    }

    // Update the exact quantity or remove the item if quantity drops to 0
    @Transactional
    public Cart updateItemQuantity(Long userId, Long productId, int newQuantity) {
        Cart cart = getOrCreateCart(userId);

        if (newQuantity <= 0) {
            // If quantity is 0 or less, remove the item completely
            cart.getCartItems().removeIf(item -> item.getProduct().getId().equals(productId));
        } else {
            // Otherwise, find it and set the exact absolute value
            cart.getCartItems().stream()
                    .filter(item -> item.getProduct().getId().equals(productId))
                    .findFirst()
                    .ifPresent(item -> item.setQuantity(newQuantity));
        }

        return cartRepository.save(cart);
    }
}