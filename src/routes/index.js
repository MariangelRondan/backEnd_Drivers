const { Router } = require("express");

const router = Router();

const {
  postDriverHandler,
  getDriversHandler,
  getDetailDriverHandler,
  // getDriversByNameHandler,
} = require("../handlers/driverHandlers");

const { getAllTeamsHandler } = require("../handlers/teamHandlers");
//   📍 GET | /drivers
// Obtiene un arreglo de objetos, donde cada objeto es un driver con su información.
// IMPORTANTE: Si un driver no tiene imagen, deberás colocarle una por defecto 🖼️

router.get("/drivers", getDriversHandler);

//   📍 GET | /drivers/:idDriver
// Esta ruta obtiene el detalle de un driver específico.
router.get("/drivers/:id", getDetailDriverHandler);

router.post("/drivers", postDriverHandler);

// Ruta para buscar drivers por nombre
// router.get("/drivers/name", getDriversByNameHandler);
// router.get("/drivers/name", getDriversByNameHandler);

router.get("/teams", getAllTeamsHandler);

module.exports = router;

/* Tu servidor deberá contar con las siguientes rutas:



📍 GET | /drivers/name?="..."
Esta ruta debe obtener los primeros 15 drivers que se encuentren con la palabra recibida por query.
Debe poder buscarlo independientemente de mayúsculas o minúsculas.
Si no existe el driver, debe mostrar un mensaje adecuado.
Debe buscar tanto los de la API como los de la base de datos.
📍 POST | /drivers
Esta ruta recibirá todos los datos necesarios para crear un driver y relacionarlo con sus teams solicitados.
Toda la información debe ser recibida por body.
Debe crear un driver en la base de datos, y este debe estar relacionado con sus teams indicados (al menos uno).
📍 GET | /teams
Obtiene un arreglo con todos los teams existentes de la API.
En una primera instancia, cuando la base de datos este vacía, deberás guardar todos los teams que encuentres en la API.
Estos deben ser obtenidos de la API (se evaluará que no haya hardcodeo). Luego de obtenerlos de la API, deben ser guardados en la base de datos para su posterior consumo desde allí.*/
