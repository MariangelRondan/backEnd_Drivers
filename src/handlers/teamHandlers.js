const { getAllTeams } = require("../controllers/teamController");

async function getAllTeamsHandler(req, res) {
  try {
    const allTeams = await getAllTeams();
    return res.status(200).json(allTeams);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getAllTeamsHandler,
};
