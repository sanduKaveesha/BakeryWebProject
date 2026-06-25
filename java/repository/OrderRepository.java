package com.bakery.repository;

import com.bakery.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findTop10ByOrderByOrderIdDesc();

    long countByOrderStatus(String orderStatus);

    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.orderStatus = 'Delivered'")
    Double calculateTotalRevenue();

    Page<Order> findByOrderStatus(String orderStatus, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE LOWER(o.user.email) LIKE LOWER(CONCAT('%',:searchTerm,'%')) OR LOWER(o.phoneNumber) LIKE LOWER(CONCAT('%',:searchTerm,'%')) OR CAST(o.orderId AS string) LIKE LOWER(CONCAT('%',:searchTerm,'%'))")
    Page<Order> searchOrders(@Param("searchTerm") String searchTerm, Pageable pageable);
}
