const { Team } = require("../db");
// const URL = "http://localhost:5000/drivers";
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const URL = process.env.URL_API;

const getAllTeams = async () => {
  const teamCount = await Team.count();
  if (teamCount === 0) {
    const { data } = await axios.get(`${URL}`);

    const teamsApi = [];
    data.forEach((driver) => {
      if (driver && driver.teams) {
        //hay 508 drivers y hay 4 que no tienen la propiedad "teams"
        if (!driver.teams.includes(",")) {
          teamsApi.push(driver.teams);
        } else {
          const teamsArray = driver.teams.split(",").map((team) => team.trim());
          teamsApi.push(...teamsArray);
        }
      }
    });
    // Remover duplicados si es necesario
    const uniqueTeams = [...new Set(teamsApi)];
    // Crea instancias de Team
    for (const team of uniqueTeams) {
      await Team.create({
        name: team,
      });
    }
  }

  const teamsBDD = await Team.findAll();
  return teamsBDD;
};

module.exports = { getAllTeams };

// const { Team } = require("../db");
// const axios = require("axios");
// const dotenv = require("dotenv");
// dotenv.config();

// const URL = process.env.URL_API;

// const getAllTeams = async () => {
//   const teamCount = await Team.count();

//   // Si ya hay equipos en la base de datos, devuélvelos directamente
//   if (teamCount > 0) {
//     const teamsBDD = await Team.findAll();
//     return teamsBDD;
//   } else {
//     // Si no hay equipos en la base de datos, espera a que se almacenen antes de obtenerlos de la API
//     const { data } = await axios.get(`${URL}`);

//     const teamsApi = [];
//     data.forEach((driver) => {
//       if (driver && driver.teams) {
//         if (!driver.teams.includes(",")) {
//           teamsApi.push(driver.teams);
//         } else {
//           const teamsArray = driver.teams.split(",").map((team) => team.trim());
//           teamsApi.push(...teamsArray);
//         }
//       }
//     });

//     const uniqueTeams = [...new Set(teamsApi)];
//     uniqueTeams.forEach(async (team) => {
//       await Team.create({
//         name: team,
//       });
//     });
//     const teamsBDD = await Team.findAll();
//     return teamsBDD;
//   }
//   // Devuelve los equipos recién almacenados en la base de datos
// };

// module.exports = { getAllTeams };
