package com.bakery.service;

import com.bakery.model.Order;
import com.bakery.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminOrderService {

    @Autowired
    private OrderRepository orderRepository;

    public Page<Order> getAllOrders(int page, int size, String sortDir, String sortField) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortField).ascending() :
                Sort.by(sortField).descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        return orderRepository.findAll(pageable);
    }

    public Page<Order> getOrdersByStatus(String status, int page, int size, String sortDir, String sortField) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortField).ascending() :
                Sort.by(sortField).descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        return orderRepository.findByOrderStatus(status, pageable);
    }

    public Page<Order> searchOrders(String searchTerm, int page, int size, String sortDir, String sortField) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortField).ascending() :
                Sort.by(sortField).descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        return orderRepository.searchOrders(searchTerm, pageable);
    }

    public Order getOrderById(Long id) {
        Optional<Order> optionalOrder = orderRepository.findById(id);
        if (optionalOrder.isPresent()) {
            return optionalOrder.get();
        }
        throw new RuntimeException(" Order not found for id :: " + id);
    }

    public Order updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus(newStatus);
        return orderRepository.save(order);
    }

    public void deleteOrder(Long orderId) {
        orderRepository.deleteById(orderId);
    }

    public Map<String, Long> getOrderSummary() {
        Map<String, Long> summary = new HashMap<>();
        summary.put("totalOrders", orderRepository.count());
        summary.put("pending", orderRepository.countByOrderStatus("Pending"));
        summary.put("preparing", orderRepository.countByOrderStatus("Preparing"));
        summary.put("delivered", orderRepository.countByOrderStatus("Delivered"));
        return summary;
    }
}
