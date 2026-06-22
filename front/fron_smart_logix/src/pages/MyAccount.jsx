import { useEffect, useState } from "react";
import { getSaveToken, getSaveUser } from "../service/authService";

export default function MyAccountPage() {
  const [accountData, setAccountData] = useState(null);
  const [error, setError] = useState("");

  const user = getSaveUser();

  useEffect(() => {
    if (!user?.userId) {
      setError("No se encontró el ID del usuario.");
      return;
    }

    fetch(`http://localhost:8080/api/users/${user.userId}/points`, {
      headers: {
        Authorization: `Bearer ${getSaveToken()}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudieron cargar los datos del usuario");
        }
        return response.json();
      })
      .then((data) => {
        setAccountData(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, [user?.userId]);

  if (error) {
    return (
      <div className="page-card">
        <h2>Mi cuenta</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!accountData) {
    return (
      <div className="page-card">
        <h2>Mi cuenta</h2>
        <p>Cargando información...</p>
      </div>
    );
  }

  const porcentaje = (accountData.puntos / 15) * 100;

  return (
    <div className="page-card">
      <h2>👤 Mi cuenta</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Información del usuario</h3>

        <p>
          <strong>ID:</strong> {accountData.userId}
        </p>

        <p>
          <strong>Usuario:</strong> {accountData.username}
        </p>

        <p>
          <strong>Rol:</strong> {user.role}
        </p>
      </div>

      <hr />

      <div style={{ marginTop: "20px" }}>
        <h3>🎁 Programa de Recompensas</h3>

        <p>
          <strong>Puntos:</strong> {accountData.puntos} / 15
        </p>

        <p>
          <strong>Envíos Gratis:</strong> {accountData.enviosGratis}
        </p>

        <div
          style={{
            width: "100%",
            height: "22px",
            backgroundColor: "#e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
            marginTop: "10px"
          }}
        >
          <div
            style={{
              width: `${porcentaje}%`,
              height: "100%",
              backgroundColor: "#22c55e",
              transition: "0.3s"
            }}
          />
        </div>

        <p style={{ marginTop: "10px" }}>
          {15 - accountData.puntos} puntos para tu próximo envío gratis 🚚
        </p>
      </div>
    </div>
  );
}