package com.bakery.repository;

import com.bakery.model.CustomCakeBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomCakeBookingRepository extends JpaRepository<CustomCakeBooking, Long> {

    List<CustomCakeBooking> findByUser_Id(Long userId);

}
