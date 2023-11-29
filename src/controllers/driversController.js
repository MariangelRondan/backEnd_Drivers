const { Driver, Team } = require("../db");
const axios = require("axios");
// const { Op } = require("sequelize");
const { conn } = require("../db");
const dotenv = require("dotenv");
dotenv.config();

const URL = process.env.URL_API;

//GET ALL DRIVERS DE API Y BDD
const getAllDrivers = async () => {
  const driversBDD = await Driver.findAll({
    include: {
      model: Team,
      attributes: ["name"], //incluye el name de cada team
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
    const teams = driver.Teams.map((team) => team.name).join(", "); //trae los teams en un array=> Teams: []

    //La variable driverData contendrá todas las demás propiedades del objeto driver.dataValues excepto Teams.
    const { Teams, ...driverData } = driver.dataValues;
    return {
      ...driverData,
      source: "BDD",
      teams,
    };
  });
  //fusiona ambos array
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
  //transaction se convierte en un objeto que representa la transacción en curso.
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
    // { transaction } asegura que esta operación esté incluida en la transacción. Si algo sale
    //mal después de este punto, esta operación se revertirá durante el rollback de la transacción.
    if (teams && teams.length > 0) {
      //Cuando estableces una relación de muchos a muchos entre dos modelos en Sequelize, se crea
      //automáticamente un método set seguido del nombre del modelo en plural para esa relación.
      await newDriver.setTeams(teams, { transaction });
    }
    //teams, { transaction } asegura que esta operación esté incluida en la transacción.

    //la transacción se confirma
    await transaction.commit();
    return newDriver;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// const getDriverByName = async (name) => {
//   const nameAdjusted = name[0].toUpperCase() + name.slice(1).toLowerCase();

//   const response = await axios.get(`${URL}?name.forename=${nameAdjusted}`);

// const data= response.data;
// const dataCleaned = infoCleaner(data)
// const apiData = dataCleaned || [];

// const driverBDD = await Driver.findAll({
//   where:{
//     name:{
//       [Op.iLike]: `%${nameAdjusted}`
//     }
//   },
//   include: [
//   {
//     model: Team,
//   attributes: ["name"],
// through: {
//   attributes: []
// }
// }
//   ]
// })
// };

//Controller para get Driver Detail
const getDriverById = async (id, source) => {
  try {
    let driver;
    if (source === "api") {
      const response = await axios.get(`${URL}/${id}`);
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
