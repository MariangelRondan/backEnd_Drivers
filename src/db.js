require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
// const { DB_USER, DB_PASSWORD, DB_HOST } = process.env;
const dataBaseDeploy = process.env.DATA_BASE_DEPLOY;

const DriverModel = require("./models/Driver");
const TeamModel = require("./models/Team");

// const sequelize = new Sequelize(
//   `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/drivers`,
//   {
//     logging: false,
//     native: false,
//   }
// );

const sequelize = new Sequelize(dataBaseDeploy, {
  logging: false,
  native: false,
});

// Obtener el nombre del archivo actual
const basename = path.basename(__filename);
const modelDefiners = [];

// Leer los archivos del directorio "models" y filtrar aquellos que son modelos
fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  // Importar cada modelo y añadirlo al array modelDefiners
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

// Iterar sobre los modelos y llamar a la función de definición para cada uno
modelDefiners.forEach((model) => model(sequelize));
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

DriverModel(sequelize);

TeamModel(sequelize);

const { Driver, Team } = sequelize.models;

Driver.belongsToMany(Team, { through: "DriverTeam", timestamps: false });
Team.belongsToMany(Driver, { through: "DriverTeam", timestamps: false });

module.exports = {
  Driver,
  Team,
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
