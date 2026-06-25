package com.bakery.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "custom_cake_booking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CustomCakeBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Excluded from JSON to prevent LazyInitializationException during serialization
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String customerName;

    private String cakeFlavor;

    private String cakeSize;

    private String messageOnCake;

    private String decorationType;

    private double price;

    private String status;
}