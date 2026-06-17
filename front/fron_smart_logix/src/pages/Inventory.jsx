import { useEffect, useState } from "react";
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  checkAvailability,
  reserveItem,
  releaseItem,
  dispatchItem,
} from "../service/inventoryService";
import { getSaveUser } from "../service/authService";

const EMPTY_FORM = { sku: "", productName: "", warehouseCode: "", initialQuantity: 0, reorderLevel: 0 };
const EMPTY_EDIT = { productName: "", warehouseCode: "", availableQuantity: 0, reorderLevel: 0 };


function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getSaveUser();
  const isAdmin = user?.role === "ROLE_ADMIN";

  // Crear
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formMsg, setFormMsg] = useState({ text: "", type: "" });
  const [formLoading, setFormLoading] = useState(false);

  // Editar
  const [editSku, setEditSku] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [editMsg, setEditMsg] = useState({ text: "", type: "" });
  const [editLoading, setEditLoading] = useState(false);

  // Operaciones
  const [opSku, setOpSku] = useState("");
  const [opQty, setOpQty] = useState(1);
  const [opMsg, setOpMsg] = useState({ text: "", type: "" });

  async function load() {
    setLoading(true);
    setError("");
    try {
      setInventory(await getInventory());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.sku.trim() || !form.productName.trim() || !form.warehouseCode.trim()) {
      setFormMsg({ text: "SKU, nombre y bodega son obligatorios", type: "error" });
      return;
    }
    setFormLoading(true);
    setFormMsg({ text: "", type: "" });
    try {
      await createInventoryItem({ ...form, initialQuantity: Number(form.initialQuantity), reorderLevel: Number(form.reorderLevel) });
      setShowCreate(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e) {
      setFormMsg({ text: e.message, type: "error" });
    } finally {
      setFormLoading(false);
    }
  }

  function openEdit(item) {
    setEditSku(item.sku);
    setEditForm({
      productName: item.productName,
      warehouseCode: item.warehouseCode,
      availableQuantity: item.availableQuantity,
      reorderLevel: item.reorderLevel,
    });
    setEditMsg({ text: "", type: "" });
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!editForm.productName.trim() || !editForm.warehouseCode.trim()) {
      setEditMsg({ text: "Nombre y bodega son obligatorios", type: "error" });
      return;
    }
    setEditLoading(true);
    setEditMsg({ text: "", type: "" });
    try {
      await updateInventoryItem(editSku, {
        productName: editForm.productName,
        warehouseCode: editForm.warehouseCode,
        availableQuantity: Number(editForm.availableQuantity),
        reorderLevel: Number(editForm.reorderLevel),
      });
      setEditSku(null);
      load();
    } catch (e) {
      setEditMsg({ text: e.message, type: "error" });
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(sku) {
    if (!window.confirm(`¿Eliminar el ítem ${sku}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteInventoryItem(sku);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function doOp(action) {
    if (!opSku.trim()) { setOpMsg({ text: "Ingrese un SKU", type: "error" }); return; }
    setOpMsg({ text: "", type: "" });
    try {
      let result;
      if (action === "check") {
        result = await checkAvailability(opSku, opQty);
        setOpMsg({ text: `Disponible: ${result.available ? "✅ Sí" : "❌ No"} — Stock: ${result.availableQuantity}`, type: "info" });
        return;
      }
      if (action === "reserve") result = await reserveItem(opSku, opQty);
      if (action === "release") result = await releaseItem(opSku, opQty);
      if (action === "dispatch") result = await dispatchItem(opSku, opQty);
      setOpMsg({ text: `${result.productName}: disponible ${result.availableQuantity} uds`, type: "success" });
      load();
    } catch (e) {
      setOpMsg({ text: e.message, type: "error" });
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <h2>🗃️ Inventario</h2>
        {isAdmin && (
          <button
            className="btn-primary"
            onClick={() => {
              setShowCreate(!showCreate);
              setEditSku(null);
            }}
          >
            {showCreate ? "Cancelar" : "+ Nuevo Ítem"}
          </button>
        )}
      </div>

      {/* Panel de operaciones */}
      <div className="op-panel">
        <h3>Operaciones sobre Stock</h3>
        <div className="form-grid">
          <label>
            SKU
            <input value={opSku} onChange={(e) => setOpSku(e.target.value)} placeholder="SKU-001" />
          </label>
          <label>
            Cantidad
            <input type="number" min="1" value={opQty} onChange={(e) => setOpQty(Number(e.target.value))} />
          </label>
        </div>
        <div className="op-buttons">
          <button className="btn-secondary" onClick={() => doOp("check")}>Verificar disponibilidad</button>
          <button className="btn-secondary" onClick={() => doOp("reserve")}>Reservar</button>
          <button className="btn-secondary" onClick={() => doOp("release")}>Liberar</button>
          <button className="btn-danger" onClick={() => doOp("dispatch")}>Despachar</button>
        </div>
        {opMsg.text && <p className={`msg msg--${opMsg.type}`}>{opMsg.text}</p>}
      </div>

      {/* Formulario crear */}
      {showCreate && (
        <form onSubmit={handleCreate} className="form-card">
          <h3>Nuevo Ítem de Inventario</h3>
          {formMsg.text && <p className={`msg msg--${formMsg.type}`}>{formMsg.text}</p>}
          <div className="form-grid">
            <label>SKU<input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU-001" /></label>
            <label>Nombre del Producto<input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} placeholder="Producto A" /></label>
            <label>Código de Bodega<input value={form.warehouseCode} onChange={(e) => setForm({ ...form, warehouseCode: e.target.value })} placeholder="BODEGA-01" /></label>
            <label>Cantidad Inicial<input type="number" min="0" value={form.initialQuantity} onChange={(e) => setForm({ ...form, initialQuantity: e.target.value })} /></label>
            <label>Nivel de Reorden<input type="number" min="0" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} /></label>
          </div>
          <button type="submit" className="btn-primary" disabled={formLoading}>
            {formLoading ? "Creando..." : "Crear Ítem"}
          </button>
        </form>
      )}

      {/* Formulario editar */}
      {editSku && (
        <form onSubmit={handleEdit} className="form-card">
          <h3>✏️ Editar Ítem: <code>{editSku}</code></h3>
          {editMsg.text && <p className={`msg msg--${editMsg.type}`}>{editMsg.text}</p>}
          <div className="form-grid">
            <label>Nombre del Producto<input value={editForm.productName} onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })} /></label>
            <label>Código de Bodega<input value={editForm.warehouseCode} onChange={(e) => setEditForm({ ...editForm, warehouseCode: e.target.value })} /></label>
            <label>Cantidad Disponible<input type="number" min="0" value={editForm.availableQuantity} onChange={(e) => setEditForm({ ...editForm, availableQuantity: e.target.value })} /></label>
            <label>Nivel de Reorden<input type="number" min="0" value={editForm.reorderLevel} onChange={(e) => setEditForm({ ...editForm, reorderLevel: e.target.value })} /></label>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="btn-primary" disabled={editLoading}>
              {editLoading ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setEditSku(null)}>Cancelar</button>
          </div>
        </form>
      )}

      {loading && <p className="loading">Cargando inventario...</p>}
      {error && <p className="msg msg--error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th><th>Producto</th><th>Bodega</th><th>Disponible</th><th>Reservado</th><th>Nivel Reorden</th><th>Actualizado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr><td colSpan="8" className="empty-row">No hay ítems en inventario</td></tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.sku} className={item.availableQuantity <= item.reorderLevel ? "row-warn" : ""}>
                    <td><code>{item.sku}</code></td>
                    <td>{item.productName}</td>
                    <td>{item.warehouseCode}</td>
                    <td>{item.availableQuantity}</td>
                    <td>{item.reservedQuantity}</td>
                    <td>{item.reorderLevel}</td>
                    <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("es-CL") : "—"}</td>
                    <td className="action-buttons">
                      {isAdmin && (
                        <>
                          <button
                            className="btn-edit"
                            onClick={() => {
                              setShowCreate(false);
                              openEdit(item);
                            }}
                          >
                            ✏️ Editar
                          </button>

                          <button
                            className="btn-danger"
                            onClick={() => handleDelete(item.sku)}
                          >
                            🗑️ Eliminar
                          </button>
                        </>
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

export default InventoryPage;
