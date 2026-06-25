package com.bakery.service;

import com.bakery.repository.OrderItemRepository;
import com.bakery.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminAnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    public Map<String, Object> getOrdersAnalytics() {
        Map<String, Object> data = new HashMap<>();
        // Mock data or real data from queries
        data.put("totalOrders", orderRepository.count());
        return data;
    }

    public Map<String, Object> getRevenueAnalytics() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalRevenue", orderRepository.calculateTotalRevenue());
        return data;
    }

    public List<Object[]> getProductPerformance() {
        return orderItemRepository.findTopSellingProducts();
    }

    public Map<String, Object> getCustomerAnalytics() {
        Map<String, Object> data = new HashMap<>();
        // Needs UserRepository for real data
        data.put("totalCustomers", 420);
        data.put("newCustomers", 62);
        return data;
    }

    public List<Object[]> getCustomCakeAnalytics() {
        return orderItemRepository.findPopularCustomCakeFlavors();
    }
}
