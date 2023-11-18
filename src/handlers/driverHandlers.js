const {
  getAllDrivers,
  postDriver,
  getDriverById,
  getDriverByName,
} = require("../controllers/driversController");

//by name y getAll de api y bdd
const getDriversHandler = async (req, res) => {
  const { name } = req.query;

  try {
    const allDrivers = await getAllDrivers();
    if (name) {
      const driversByName = allDrivers.filter((driver) =>
        driver.name.toLowerCase().startsWith(name.toLowerCase())
      );
      if (driversByName.length > 0) {
        const quinceDrivers = driversByName.slice(0, 15);

        res.status(200).json(quinceDrivers);
      } else {
        res.status(404).send("Not found");
      }

      // if (name) {
      //   const driversByName = await getDriverByName(name);

      //   if (driversByName.length === 0) {
      //     res.status(404).json({ message: "No se encontraron coincidencias" });
      //   } else {
      //     return res.status(200).json(driversByName);
      //   }
    } else {
      // const allDrivers = await getAllDrivers();
      return res.status(200).json(allDrivers);
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

//Post driver
const postDriverHandler = async (req, res) => {
  const { name, lastname, description, image, nationality, dob, teams } =
    req.body;

  try {
    if (!name || !lastname || !description || !dob) {
      return res.status(400).json({ error: "Missing required data..." });
    }
    const newDriver = await postDriver({
      name,
      lastname,
      description,
      nationality,
      dob,
      image,
      teams,
    });

    res
      .status(201)
      .json({ message: "Driver created successfully", driver: newDriver });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📍 GET | /drivers/:idDriver
const getDetailDriverHandler = async (req, res) => {
  const { id } = req.params;
  const source = isNaN(id) ? "bdd" : "api";

  try {
    const response = await getDriverById(id, source);

    if (response) {
      res.status(200).json(response);
    } else {
      res.status(404).json({ error: "Conductor no encontrado." });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error en el servidor." });
  }
};

module.exports = {
  getDriversHandler,
  postDriverHandler,
  getDetailDriverHandler,
  getDriverByName,
};
