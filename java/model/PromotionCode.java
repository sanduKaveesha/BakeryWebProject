package com.bakery.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "promotion_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PromotionCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String promoCode;

    private double discountPercentage;

    private boolean active;
}