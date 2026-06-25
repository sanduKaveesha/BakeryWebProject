package com.bakery.service;

import com.bakery.model.CustomCakeBooking;
import com.bakery.repository.CustomCakeBookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomCakeBookingService {

    @Autowired
    private CustomCakeBookingRepository repository;

    // Create booking
    public CustomCakeBooking createBooking(CustomCakeBooking booking) {
        booking.setStatus("Pending");
        return repository.save(booking);
    }

    // Get all bookings
    public List<CustomCakeBooking> getAllBookings() {
        return repository.findAll();
    }

    // Get bookings for a specific user
    public List<CustomCakeBooking> getBookingsByUser(Long userId) {
        return repository.findByUser_Id(userId);
    }

    // Get booking by ID
    public Optional<CustomCakeBooking> getBookingById(Long id) {
        return repository.findById(id);
    }

    // Update booking status
    public CustomCakeBooking updateStatus(Long id, String status) {

        CustomCakeBooking booking = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(status);

        return repository.save(booking);
    }

    // Delete booking
    public void deleteBooking(Long id) {
        repository.deleteById(id);
    }
}