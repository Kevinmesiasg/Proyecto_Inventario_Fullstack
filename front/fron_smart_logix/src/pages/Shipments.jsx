import { useEffect, useState } from "react";
import {
  getShipment,
  createShipment,
  updateShipmentStatus,
  getShipmentByTracking,
  deleteShipment,
} from "../service/shipmentService";
import { getSaveUser } from "../service/authService";

const STATUSES = ["PLANNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];

const STATUS_LABEL = {
  PLANNED: "Planificado",
  PICKED_UP: "Recogido",
  IN_TRANSIT: "En tránsito",
  DELIVERED: "Entregado",
};

function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getSaveUser();
  const isAdmin = user?.role === "ROLE_ADMIN";

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    orderNumber: "",
    destinationAddress: "",
    totalUnits: 1,
  });
  const [formMsg, setFormMsg] = useState({ text: "", type: "" });
  const [formLoading, setFormLoading] = useState(false);

  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      setShipments(await getShipment());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();

    if (!user?.userId) {
      setFormMsg({
        text: "No se encontró el ID del usuario. Cierra sesión y vuelve a iniciar.",
        type: "error",
      });
      return;
    }

    if (!form.orderNumber.trim() || !form.destinationAddress.trim()) {
      setFormMsg({
        text: "Complete todos los campos",
        type: "error",
      });
      return;
    }

    setFormLoading(true);
    setFormMsg({ text: "", type: "" });

    try {
      await createShipment({
        userId: user.userId,
        orderNumber: form.orderNumber.trim().toUpperCase(),
        destinationAddress: form.destinationAddress.trim(),
        totalUnits: Number(form.totalUnits),
      });

      setShowCreate(false);
      setForm({
        orderNumber: "",
        destinationAddress: "",
        totalUnits: 1,
      });

      load();
    } catch (e) {
      setFormMsg({ text: e.message, type: "error" });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleStatusChange(trackingCode, value) {
    try {
      await updateShipmentStatus(trackingCode, value);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete(trackingCode) {
    if (!window.confirm(`¿Eliminar el envío ${trackingCode}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteShipment(trackingCode);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();

    if (!searchCode.trim()) return;

    setSearchError("");
    setSearchResult(null);

    try {
      setSearchResult(await getShipmentByTracking(searchCode.trim()));
    } catch (e) {
      setSearchError(e.message);
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <h2>📦 Envíos</h2>

        <button
          className="btn-primary"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? "Cancelar" : "+ Nuevo Envío"}
        </button>
      </div>

      <div className="search-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            placeholder="Buscar por tracking code..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />

          <button type="submit" className="btn-secondary">
            Buscar
          </button>

          {searchResult && (
            <button
              type="button"
              className="btn-clear"
              onClick={() => setSearchResult(null)}
            >
              ✕ Limpiar
            </button>
          )}
        </form>

        {searchError && <p className="msg msg--error">{searchError}</p>}

        {searchResult && (
          <div className="search-result">
            <strong>{searchResult.trackingCode}</strong> —{" "}
            {searchResult.orderNumber} —{" "}
            {STATUS_LABEL[searchResult.status] || searchResult.status}
          </div>
        )}
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="form-card">
          <h3>Nuevo Envío</h3>

          {formMsg.text && (
            <p className={`msg msg--${formMsg.type}`}>{formMsg.text}</p>
          )}

          <div className="form-grid">
            <label>
              Número de Orden
              <input
                value={form.orderNumber}
                onChange={(e) =>
                  setForm({ ...form, orderNumber: e.target.value })
                }
                placeholder="ORD-2025-001"
              />
            </label>

            <label>
              Dirección de Destino
              <input
                value={form.destinationAddress}
                onChange={(e) =>
                  setForm({ ...form, destinationAddress: e.target.value })
                }
                placeholder="Av. Principal 123, Ciudad"
              />
            </label>

            <label>
              Total de Unidades
              <input
                type="number"
                min="1"
                value={form.totalUnits}
                onChange={(e) =>
                  setForm({ ...form, totalUnits: e.target.value })
                }
              />
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={formLoading}>
            {formLoading ? "Creando..." : "Crear Envío"}
          </button>
        </form>
      )}

      {loading && <p className="loading">Cargando envíos...</p>}
      {error && <p className="msg msg--error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tracking</th>
                <th>Orden</th>
                <th>Transportista</th>
                <th>Ruta</th>
                <th>Entrega Est.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    No hay envíos registrados
                  </td>
                </tr>
              ) : (
                shipments.map((shipment) => (
                  <tr key={shipment.trackingCode}>
                    <td>
                      <code>{shipment.trackingCode}</code>
                    </td>

                    <td>{shipment.orderNumber}</td>
                    <td>{shipment.carrier}</td>
                    <td>{shipment.routeCode}</td>
                    <td>{shipment.estimatedDeliveryDate}</td>

                    <td>
                      {isAdmin ? (
                        <select
                          value={shipment.status}
                          onChange={(e) =>
                            handleStatusChange(
                              shipment.trackingCode,
                              e.target.value
                            )
                          }
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABEL[status]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        STATUS_LABEL[shipment.status] || shipment.status
                      )}
                    </td>

                    <td className="action-buttons">
                      {isAdmin && (
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(shipment.trackingCode)}
                        >
                          🗑️ Eliminar
                        </button>
                      )}
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

export default ShipmentsPage;