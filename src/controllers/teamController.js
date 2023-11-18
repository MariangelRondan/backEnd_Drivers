// 📍 GET | /teams
// Obtiene un arreglo con todos los teams existentes de la API.
// En una primera instancia, cuando la base de datos este vacía, deberás guardar todos los teams que encuentres en la API.
// Estos deben ser obtenidos de la API (se evaluará que no haya hardcodeo). Luego de obtenerlos de la API, deben ser
//guardados en la base de datos para su posterior consumo desde allí.*/
//POST NEW DRIVER
const { Team } = require("../db");
const URL = "http://localhost:5000/drivers";
const axios = require("axios");

const getAllTeams = async () => {
  // Verificar si la tabla de equipos está vacía
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

    // Ahora puedes crear instancias de Team
    uniqueTeams.forEach(async (team) => {
      await Team.create({
        name: team,
      });
    });
  }

  const teamsBDD = await Team.findAll();
  return teamsBDD;
};

module.exports = { getAllTeams };
