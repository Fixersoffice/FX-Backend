const router = require("express").Router();
const professionalController = require("../../controllers/professional/professional.controller");

router.post("/add", professionalController.createProfessions);
router.get("/list", professionalController.listProfessions);

module.exports.professionRouter = router;
