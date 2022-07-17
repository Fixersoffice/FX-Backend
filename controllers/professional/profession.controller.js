const Profession = require("../../models/professions.models");
const { successResMsg } = require("../../utils/libs/response");
const AppError = require("../../utils/libs/appError");

exports.createProfessions = async (req, res, next) => {
  const { professionType } = req.body;
  const newProfession = new Profession({
    professionType,
  });
  try {
    await newProfession.save();
    return successResMsg(res, "Profession created successfully", newProfession);
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// fetch list of professions
exports.listProfessions = async (req, res, next) => {
  try {
    const professions = await Profession.find();
    return successResMsg(res, "Professions fetched successfully", professions);
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
