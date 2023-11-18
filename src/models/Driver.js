const { DataTypes } = require("sequelize");
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define(
    "Driver",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,

        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      nationality: {
        type: DataTypes.STRING,
      },
      dob: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    { timestamps: false }
  );
};

/* 📍 MODELO 1 | Drivers

ID (deben ser distintos a los que vienen de la API). *
Nombre. *
Apellido. *
Descripción. *
Imagen. *
Nacionalidad. *
Fecha de Nacimiento. *



*/
