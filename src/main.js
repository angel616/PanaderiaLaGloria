import express from "express";
import { conectarDB } from "./conexiones/db.js";
import Ventas from "./conexiones/db.js";
import Corte from "./conexiones/cortes.js";
import Inventario from "./conexiones/inventario.js";


const app = express();
const PORT = process.env.PORT || 3000;

conectarDB();

// Middleware para recibir JSON
app.use(express.json());

// Habilitar CORS temporalmente
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    next();
});

app.post("/cortes", async (req, res) => {
    try {
        const nuevoCorte = new Corte(req.body);
        await nuevoCorte.save();
        res.status(201).json({ message: "Corte guardado correctamente" });
    } catch (error) {
        console.error("❌ Error al guardar el corte:", error);
        res.status(500).json({ message: "Error al guardar el corte", error: error.message });
    }
});
app.post("/ventas", async (req, res) => {
    try {
        const nuevaVenta = new Ventas(req.body);
        await nuevaVenta.save();
        res.status(201).json({ message: "Venta registrada correctamente" });
    } catch (error) {
        console.error("Error al guardar la venta:", error);
        res.status(500).json({ message: "Error al registrar la venta", error: error.message });
    }
});
app.get("/ventas", async (req, res) => {
    try {
        const { inicio, fin } = req.query;

        let filtro = {};
        if (inicio && fin) {
            // Convertir a Date y mantener en UTC sin aplicar desfases adicionales
            const fechaInicio = new Date(inicio + "Z");
            const fechaFin = new Date(fin + "Z");
            filtro.fecha = { $gte: fechaInicio, $lte: fechaFin };
        }

        console.log("🕒 Filtro de búsqueda UTC:", filtro);

        const ventas = await Ventas.find(filtro).sort({ fecha: 1 });
        res.json(ventas);
    } catch (error) {
        console.error("❌ Error al obtener ventas:", error);
        res.status(500).json({ message: "Error al obtener ventas del día" });
    }
});

//INVENTARIO

// 🔹 Obtener todo el inventario
app.get("/inventario", async (req, res) => {
    const panes = await Inventario.find();
    res.json(panes);
});

// 🔹 Agregar pan nuevo
app.post("/inventario", async (req, res) => {
    const { nombre, cantidad, precio, categoria } = req.body;
    try {
        const nuevoPan = new Inventario({ nombre, cantidad, precio, categoria });
        await nuevoPan.save();
        res.json({ mensaje: "Pan agregado al inventario" });
    } catch (error) {
        res.status(500).json({ error: "Error al agregar pan", detalle: error.message });
    }
});
app.get("/inventario", async (req, res) => {
    const panes = await Inventario.find();
    res.json(panes);
});

// 🔹 Editar pan existente
app.put("/inventario/:id", async (req, res) => {
    try {
        await Inventario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ mensaje: "Inventario actualizado" });
    } catch (error) {
        res.status(500).json({ error: "Error al editar pan" });
    }
});

// 🔹 Eliminar pan
app.delete("/inventario/:id", async (req, res) => {
    try {
        await Inventario.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Pan eliminado del inventario" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar pan" });
    }
});
app.post("/inventario/update-stock", async (req, res) => {
    const { nombre, cantidadVendida } = req.body;
    await Inventario.findOneAndUpdate(
        { nombre: nombre.toLowerCase() },
        { $inc: { cantidad: -cantidadVendida }, $set: { fechaActualizacion: new Date() } }
    );
    res.json({ mensaje: "Inventario actualizado tras venta" });
});

app.get("/", (req, res) => {
  res.send("🚀 Servidor Panadería La Gloria funcionando correctamente");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

