import { useEffect, useState } from "react";
import { getSaveToken } from "../service/authService";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/users",
        {
          headers: {
            Authorization: `Bearer ${getSaveToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("No se pudieron cargar los usuarios");
      }

      const data = await response.json();
      setUsers(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <main className="page">
      <div className="page-header">
        <h2>👥 Usuarios Registrados</h2>
      </div>

      {loading && (
        <p className="loading">
          Cargando usuarios...
        </p>
      )}

      {error && (
        <p className="msg msg--error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Puntos</th>
                <th>Envíos Gratis</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>

                    <td>
                      <strong>{user.username}</strong>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      <span
                        className={
                          user.role === "ROLE_ADMIN"
                            ? "badge-admin"
                            : "badge-user"
                        }
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>{user.puntos}</td>

                    <td>
                      {user.enviosGratis > 0
                        ? ` ${user.enviosGratis}`
                        : "0"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}