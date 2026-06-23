import { httpRequest } from "./httpClient";

// GET /api/orders
export function getOrdersRequest(auth) {
  return httpRequest("/api/orders", { headers: { Authorization: auth } });
}

// GET /api/orders/{orderNumber}
export function getOrderByNumberRequest(orderNumber, auth) {
  return httpRequest(`/api/orders/${orderNumber}`, { headers: { Authorization: auth } });
}

export function createOrderRequest(data, auth) {
  return httpRequest("/api/orders", {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
