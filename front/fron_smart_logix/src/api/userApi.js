import { httpRequest } from "./httpClient";

export function getMyPointsRequest(auth) {
  return httpRequest("/api/users/me/points", {
    headers: { Authorization: auth },
  });
}

export function getUsersRequest(auth) {
  return httpRequest("/api/users", {
    headers: { Authorization: auth },
  });
}