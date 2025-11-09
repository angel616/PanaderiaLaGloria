import mongoose from "mongoose";

const InventarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    cantidad: { type: Number, required: true, default: 0 },
    precio: { type: Number, required: true, default: 0 }, // opcional, para referencia
    categoria: { type: String, default: "pan" }, // puedes agrupar por tipo
    fechaActualizacion: { type: Date, default: Date.now }
});

export default mongoose.model("Inventario", InventarioSchema);