import mongoose from "mongoose";

const uri = "mongodb+srv://freefirenormal15_db_user:G0b09YQ2FahxauJx@cluster0.lcknkuv.mongodb.net/?appName=Cluster0";


export async function conectarDB() {
    try {
        await mongoose.connect(uri);
        console.log("✅ Conexión a MongoDB Atlas exitosa");
    } catch (error) {
        console.error("❌ Error al conectar a MongoDB Atlas:", error);
    }
}

const Ventas = new mongoose.Schema({
    fecha: { type: Date, default: () => new Date() },
    productos: [
        {
            nombre: { type: String, required: true },     // nombre del pan
            cantidad: { type: Number, required: true },   // cantidad vendida
            precioUnitario: { type: Number, required: true }, // precio por pieza
            subtotal: { type: Number, required: true }    // cantidad * precioUnitario
        }
    ],
    total: {
        type: Number,
        required: true
    },
    pago: {
        type: Number,
        required: true
    },
    cambio: {
        type: Number,
        required: true
    },
    metodoPago: {
        type: String,
        enum: ["efectivo", "tarjeta", "transferencia"],
        default: "efectivo"
    },
});
export default mongoose.model("Ventas", Ventas);
