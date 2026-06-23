package com.smartlogix.order.client;

public record ShipmentRequest(
        Long userId,
        String orderNumber,
        String destinationAddress,
        int totalUnits
) {
}