const express = require("express");
const router = require("./routes");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");

const server = express();

server.use(morgan("dev"));
server.use(express.json());
server.use(cors());
server.use(bodyParser.json());
server.use(router);

// habilitan y configuran el manejo de solicitudes CORS en el servidor. Esto es útil cuando tu servidor necesita interactuar con aplicaciones web en otros dominios y deseas controlar quién tiene acceso a tus recursos y qué métodos HTTP están permitidos
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

module.exports = server;
