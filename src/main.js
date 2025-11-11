/*

  Archivo: src/main.js
  Descripción: Sistema de la panadería.
  Autor: ANGEL CASTILLO
  Fecha: 2025-10-11
  Versión: 1.0.0
    "Original"
  Cambios: - 2024-06-15: Se agregó CORS para permitir solicitudes desde el frontend.
  - 2024-06-20: Se mejoró el manejo de fechas en las consultas de ventas.
  - 2024-06-25: Se optimizó la actualización del inventario tras ventas.
  - 2024-06-30: Se añadieron mensajes de error más detallados en las respuestas de la API.
*/


import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { conectarDB } from "./conexiones/db.js";
import Ventas from "./conexiones/db.js";
import Corte from "./conexiones/cortes.js";
import Inventario from "./conexiones/inventario.js";
import cors from "cors"; // ✅ Importar cors

const app = express();
const PORT = process.env.PORT || 3000;

// Necesario para rutas absolutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

conectarDB();

app.use(express.json());

app.use(cors({ origin: "*" }));

// Servir archivos estáticos
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ===================== RUTAS ======================


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

// ================== INVENTARIO ===================

app.get("/inventario", async (req, res) => {
  const panes = await Inventario.find();
  res.json(panes);
});

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

// 🔹 Editar pan
app.put("/inventario/:id", async (req, res) => {
  try {
    const { cantidad } = req.body;
    if (typeof cantidad !== "number") {
      return res.status(400).json({ mensaje: "La cantidad debe ser un número" });
    }

    // 👇 suma la cantidad actual, sin modificar nombre, precio o categoría
    const productoActualizado = await Inventario.findByIdAndUpdate(
      req.params.id,
      { $inc: { cantidad: cantidad } },
      { new: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json({
      mensaje: `Cantidad sumada correctamente`,
      productoActualizado,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al actualizar inventario" });
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

// 🔹 Actualizar stock tras venta
app.post("/inventario/update-stock", async (req, res) => {
  const { nombre, cantidadVendida } = req.body;
  await Inventario.findOneAndUpdate(
    { nombre: nombre.toLowerCase() },
    { $inc: { cantidad: -cantidadVendida }, $set: { fechaActualizacion: new Date() } }
  );
  res.json({ mensaje: "Inventario actualizado tras venta" });
});

// ================== SERVIDOR ===================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
