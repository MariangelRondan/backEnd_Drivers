const { Driver, Team } = require("../db");
const axios = require("axios");
// const URL = "http://localhost:5000/drivers";
const { Op } = require("sequelize");
const { conn } = require("../db");
const dotenv = require("dotenv");
dotenv.config();

const URL = process.env.URL_API;

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
      const teams = responseBDD.dataValues.Teams.map((team) => team.name).join(
        ", "
      );

      const driversBDD = {
        ...responseBDD.dataValues,
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
    return null;
  }
};

//responseBDD=> [
// [0]   Driver {
//   [0]     dataValues: {
//   [0]       id: '82fc7596-5624-4ebb-bb6a-746f5444a62f',
//   [0]       name: 'gabi',
//   [0]       lastname: 'silvera',
//   [0]     _previousDataValues: {
//   [0]       id: '82fc7596-5624-4ebb-bb6a-746f5444a62f',
//   [0]       name: 'gabi',
//   [0]       lastname: 'silvera',
//   [0]
//   [0]     },
//   [0]     uniqno: 1,
//   [0]     _changed: Set(0) {},
//   [0]     _options: {
//   [0]       isNewRecord: false,
//   [0]       _schema: null,
//   [0]
//   [0]     },
//   [0]     isNewRecord: false,
//   [0]     Teams: [ [Team], [Team] ]
//   [0]   }
//   [0] ]

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

module.exports = { getDriverById, getAllDrivers, postDriver };
