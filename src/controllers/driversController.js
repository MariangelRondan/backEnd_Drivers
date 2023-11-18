const { Driver, Team } = require("../db");
const axios = require("axios");
const URL = "http://localhost:5000/drivers";
const { Op } = require("sequelize");
const { conn } = require("../db");

//GET ALL DRIVERS DE API Y BDD
const getAllDrivers = async () => {
  const driversBDD = await Driver.findAll({
    include: {
      model: Team,
      attributes: ["name"],
      through: {
        attributes: [],
      },
    },
  });

  const infoApi = (await axios.get(`${URL}`)).data;

  const driverApi = infoCleaner(infoApi).map((driver) => ({
    ...driver,
    source: "API",
  }));

  const driversBDDWithSource = driversBDD.map((driver) => {
    const teams = driver.Teams.map((team) => team.name).join(", ");
    const { Teams, ...driverData } = driver.dataValues;
    return {
      ...driverData,
      source: "BDD",
      teams,
    };
  });
  console.log(driversBDD);

  return [...driversBDDWithSource, ...driverApi];
};

//POST NEW DRIVER
// req.body {
//   "name": "lucas",
//   "lastname": "lopes",
//   "description": " el mas lindo del mundo",
//   "nationality": "urug",
//   "dob": "1999-01-22",
// 	"image": "https://t1.uc.ltmcdn.com/es/posts/1/2/5/significado_de_la_bandera_y_escudo_de_brasil_49521_600.webp",
//   "teams": [1,2]
// }
const postDriver = async ({
  name,
  lastname,
  description,
  image,
  nationality,
  dob,
  teams,
}) => {
  const transaction = await conn.transaction();

  try {
    const newDriver = await Driver.create(
      {
        name,
        lastname,
        description,
        image,
        nationality,
        dob,
      },
      { transaction }
    );

    if (teams && teams.length > 0) {
      await newDriver.setTeams(teams, { transaction });
    }

    await transaction.commit();

    return newDriver;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

//Controller para get Driver Detail
const getDriverById = async (id, source) => {
  try {
    let driver;

    if (source === "api") {
      const response = await axios.get(`http://localhost:5000/drivers/${id}`);
      console.log(response.data);
      //body del post:
      // driver = {
      //   id: response.data.id,
      //   name: response.data.name.forename,
      //   surname: response.data.name.surname,
      // };

      const driverArray = infoCleaner([response.data]);
      driver = driverArray[0];
    } else if (source === "bdd") {
      const responseBDD = await Driver.findByPk(id, {
        include: {
          model: Team,
          attributes: ["name"],
          through: {
            attributes: [],
          },
        },
      });
      console.log(responseBDD);

      const teams = responseBDD.dataValues.Teams.map((team) => team.name).join(
        ", "
      );

      const driversBDD = {
        ...responseBDD.dataValues, // Obten los valores reales de Sequelize
        source: "BDD",
        teams: teams,
      };

      driver = driversBDD;
    } else {
      throw new Error("Fuente no válida.");
    }
    return driver;
  } catch (error) {
    console.error(error);
    return null; // Devuelve null en caso de error
  }
};

//DEPURA LA RESPUESTA DE LA API PARA TRAER SOLO INFO NECESARIA
const infoCleaner = (array) => {
  return array.map((element) => {
    return {
      id: element.id,
      name: element.name.forename,
      surname: element.name.surname,
      description: element.description,
      image: element.image.url,
      nationality: element.nationality,
      dob: element.dob,
      teams: element.teams,
    };
  });
};

//BUSQUEDA POR NAME BY QUERY
// 📍 GET | /drivers/name?="..."
// Esta ruta debe obtener los primeros 15 drivers que se encuentren con la palabra recibida por query.
// Debe poder buscarlo independientemente de mayúsculas o minúsculas.
// Si no existe el driver, debe mostrar un mensaje adecuado.
// Debe buscar tanto los de la API como los de la base de datos.
const getDriverByName = async (name) => {
  const nameAdjusted = name[0].toUpperCase() + name.slice(1).toLowerCase();

  const response = await axios(
    `http://localhost:5000/drivers?name.forename=${nameAdjusted}`
  );
  const data = response.data;
  const dataCleaned = infoCleaner(data);
  const apiData = dataCleaned || [];

  const driverBDD = await Driver.findAll({
    where: {
      name: {
        [Op.iLike]: `%${nameAdjusted}%`,
      },
    },
    include: [
      {
        model: Team,
        attributes: ["name"],
        through: {
          attributes: [],
        },
      },
    ],
  });

  const combinedResults = driverBDD.concat(apiData).slice(0, 15);

  return combinedResults;
};

module.exports = { getDriverById, getDriverByName, getAllDrivers, postDriver };

// const driversBDDWithSource = driversBDD.map((driver) => ({
//   ...driver.dataValues, // Para obtener los valores reales de Sequelize
//   source: "BDD",
//   teams: driver.Teams.map((team) => team.name).join(", "),

// } ));
