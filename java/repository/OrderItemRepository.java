package com.bakery.repository;

import com.bakery.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder_OrderId(Long orderId);

    @Query("SELECT oi.product.name, SUM(oi.quantity) as totalSold FROM OrderItem oi WHERE oi.product IS NOT NULL GROUP BY oi.product.name ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProducts();

    @Query("SELECT oi.customCake.cakeFlavor, COUNT(oi) as flavorCount FROM OrderItem oi WHERE oi.customCake IS NOT NULL GROUP BY oi.customCake.cakeFlavor ORDER BY flavorCount DESC")
    List<Object[]> findPopularCustomCakeFlavors();
}
