package com.bakery.controller;

import com.bakery.model.Order;
import com.bakery.service.AdminOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "*")
public class AdminOrderController {

    @Autowired
    private AdminOrderService adminOrderService;

    @GetMapping
    public ResponseEntity<Page<Order>> getOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(defaultValue = "orderId") String sortField,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        Page<Order> orders;
        if (search != null && !search.isEmpty()) {
            orders = adminOrderService.searchOrders(search, page, size, sortDir, sortField);
        } else if (status != null && !status.equalsIgnoreCase("All")) {
            orders = adminOrderService.getOrdersByStatus(status, page, size, sortDir, sortField);
        } else {
            orders = adminOrderService.getAllOrders(page, size, sortDir, sortField);
        }
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderDetails(@PathVariable Long id) {
        return ResponseEntity.ok(adminOrderService.getOrderById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        adminOrderService.updateOrderStatus(id, newStatus);
        return ResponseEntity.ok().body("{\"message\": \"Status updated successfully\"}");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        adminOrderService.deleteOrder(id);
        return ResponseEntity.ok().body("{\"message\": \"Order deleted successfully\"}");
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getOrderSummary() {
        return ResponseEntity.ok(adminOrderService.getOrderSummary());
    }
}
