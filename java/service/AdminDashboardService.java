package com.bakery.service;

import com.bakery.model.Order;
import com.bakery.repository.OrderRepository;
import com.bakery.repository.UserRepository;
import com.bakery.repository.ProductRepository;
import com.bakery.repository.CustomCakeBookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminDashboardService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomCakeBookingRepository customCakeRepository;

    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();

        summary.put("totalOrders", orderRepository.count());
        summary.put("totalProducts", productRepository.count());
        summary.put("totalUsers", userRepository.count());
        summary.put("customCakeRequests", customCakeRepository.count());
        summary.put("pendingOrders", orderRepository.countByOrderStatus("Pending"));

        Double totalRevenue = orderRepository.calculateTotalRevenue();
        summary.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        return summary;
    }

    public List<Order> getRecentOrders() {
        return orderRepository.findTop10ByOrderByOrderIdDesc();
    }

    public Map<String, Long> getOrderStatusOverview() {
        Map<String, Long> overview = new HashMap<>();
        overview.put("Pending", orderRepository.countByOrderStatus("Pending"));
        overview.put("Preparing", orderRepository.countByOrderStatus("Preparing"));
        overview.put("Completed", orderRepository.countByOrderStatus("Delivered")); // Map Delivered to Completed for UI
        overview.put("Cancelled", orderRepository.countByOrderStatus("Cancelled"));
        return overview;
    }
}
