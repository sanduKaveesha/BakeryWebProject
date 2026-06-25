package com.bakery.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "saved_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    private String cardholderName;
    private String cardNumber; // In production, never store raw numbers; mask it or use a gateway token
    private String expiryDate; // MM/YY
}