const router = require("express").Router();
const artisanController = require("../../controllers/artisan/artisan.controller");

router.post("/add", artisanController.createArtisan);
router.get("/list", artisanController.listArtisans);

module.exports.artisanRouter = router;
