package com.bakery.controller;

import com.bakery.service.AdminAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = "*")
public class AdminAnalyticsController {

    @Autowired
    private AdminAnalyticsService analyticsService;

    @GetMapping("/orders")
    public ResponseEntity<?> getOrdersAnalytics() {
        return ResponseEntity.ok(analyticsService.getOrdersAnalytics());
    }

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueAnalytics() {
        return ResponseEntity.ok(analyticsService.getRevenueAnalytics());
    }

    @GetMapping("/products")
    public ResponseEntity<?> getProductPerformance() {
        return ResponseEntity.ok(analyticsService.getProductPerformance());
    }

    @GetMapping("/customers")
    public ResponseEntity<?> getCustomerAnalytics() {
        return ResponseEntity.ok(analyticsService.getCustomerAnalytics());
    }

    @GetMapping("/custom-cakes")
    public ResponseEntity<?> getCustomCakeAnalytics() {
        return ResponseEntity.ok(analyticsService.getCustomCakeAnalytics());
    }
}
