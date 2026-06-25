package com.bakery.dto;

public record PromoUpdateResponse(
    double originalTotal,
    double discountAmount,
    double finalTotal,
    String message
) {}