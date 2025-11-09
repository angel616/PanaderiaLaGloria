import mongoose from "mongoose";




const CorteSchema = new mongoose.Schema({
    fecha: { type: Date, required: true, default: Date.now },

    // 🔹 Totales del día
    totalVentaPrincipal: { type: Number, required: true },
    totalGastosPrincipal: { type: Number, required: true },
    totalNetoPrincipal: { type: Number, required: true },
    entregadoPrincipal: { type: Number, required: true },
    diferenciaPrincipal: { type: Number, required: true },
    // 🔹 Gastos registrados
    gastos: [
        {
            nombre: String,
            monto: Number,
            explicacion: String,
        }
    ],
    // 🔹 Resumen general
    totalFinalDelDia: { type: Number, required: true },

    // 🔹 Totales de bolillo/bolsa
    totalBolillo: { type: Number, required: true },
    totalBolsa: { type: Number, required: true },
    totalGastosBolilloBolsa: { type: Number, required: true },
    totalNetoBolilloBolsa: { type: Number, required: true },

    // 🔹 Dinero entregado y diferencias
    entregadoBolilloBolsa: { type: Number, required: false, default: 0 },
});

export default mongoose.model("Corte", CorteSchema);