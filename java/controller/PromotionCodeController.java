package com.bakery.controller;

import com.bakery.model.PromotionCode;
import com.bakery.service.PromotionCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin("*")
public class PromotionCodeController {

    @Autowired
    private PromotionCodeService service;

    // Generate new promotion code
    @PostMapping("/generate")
    public PromotionCode generatePromotion(
            @RequestParam double discountPercentage) {

        return service.createPromotion(discountPercentage);
    }

    // Get all promotion codes
    @GetMapping("/all")
    public List<PromotionCode> getAllPromotions() {

        return service.getAllPromotions();
    }

    // Update discount percentage
    @PutMapping("/update/{id}")
    public PromotionCode updateDiscount(
            @PathVariable Long id,
            @RequestParam double discountPercentage) {

        return service.updateDiscount(id, discountPercentage);
    }

    // Delete promotion code
    @DeleteMapping("/delete/{id}")
    public String deletePromotion(@PathVariable Long id) {

        service.deletePromotion(id);

        return "Promotion code deleted successfully";
    }
}