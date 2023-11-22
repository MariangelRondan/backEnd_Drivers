const { Router } = require("express");
const router = Router();
const {
  postDriverHandler,
  getDriversHandler,
  getDetailDriverHandler,
} = require("../handlers/driverHandlers");

const { getAllTeamsHandler } = require("../handlers/teamHandlers");

router.get("/drivers", getDriversHandler);

router.get("/drivers/:id", getDetailDriverHandler);

router.post("/drivers", postDriverHandler);

router.get("/teams", getAllTeamsHandler);

module.exports = router;
