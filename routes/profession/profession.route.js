const router = require("express").Router();
const professionController = require("../../controllers/professional/profession.controller");

router.post("/createProfessions", professionController.createProfessions);
router.get("/getProfessions", professionController.listProfessions);

module.exports.professionRouter = router;
