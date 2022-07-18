const router = require("express").Router();
const professionController = require("../../controllers/professional/profession.controller");

router.post("/add", professionController.createProfessions);
router.get("/list", professionController.listProfessions);

module.exports.professionRouter = router;
