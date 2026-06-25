package com.bakery.service;

import com.bakery.model.PromotionCode;
import com.bakery.repository.PromotionCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class PromotionCodeService {

    @Autowired
    private PromotionCodeRepository repository;

    // Generate random promo code
    private String generateCode() {

        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        StringBuilder code = new StringBuilder();

        Random random = new Random();

        for (int i = 0; i < 8; i++) {
            code.append(characters.charAt(random.nextInt(characters.length())));
        }

        return code.toString();
    }

    // Create new promotion code
    public PromotionCode createPromotion(double discountPercentage) {

        PromotionCode promotion = new PromotionCode();

        promotion.setPromoCode(generateCode());
        promotion.setDiscountPercentage(discountPercentage);
        promotion.setActive(true);

        return repository.save(promotion);
    }

    // Get all promotion codes
    public List<PromotionCode> getAllPromotions() {
        return repository.findAll();
    }

    // Update discount percentage
    public PromotionCode updateDiscount(Long id, double discountPercentage) {

        PromotionCode promotion = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion code not found"));

        promotion.setDiscountPercentage(discountPercentage);

        return repository.save(promotion);
    }

    // Delete promotion code
    public void deletePromotion(Long id) {

        repository.deleteById(id);
    }
}