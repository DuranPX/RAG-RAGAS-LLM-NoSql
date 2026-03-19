// src/index.js  ← punto de entrada del backend
require("dotenv").config();

const express   = require("express");
const { connectDB } = require("./config/db");
const apiRouter = require("./routes/index");

const app  = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: "5mb" }));

app.use("/api", apiRouter);

// Arrancar solo cuando Atlas esté conectado
(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
  });
})();

module.exports = app;