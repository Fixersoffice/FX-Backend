const Profession = require("../../models/professions.models");
const { successResMsg } = require("../../utils/libs/response");
const AppError = require("../../utils/libs/appError");

exports.createProfessions = async (req, res, next) => {
  const { professionType } = req.body;
  const newProfession = await Profession.create({ professionType });
  try {
    await newProfession.save();
    const dataInfo = {
      message: "Profession created successfully",
      data: newProfession,
    };
    return successResMsg(res, 201, dataInfo);
  } catch (error) {
    console.log(error);
    return next(new AppError(error.message, error.statusCode));
  }
};

// fetch list of professions
exports.listProfessions = async (req, res, next) => {
  try {
    const professions = await Profession.find().select([
      "-__v",
      "-createdAt",
      "-updatedAt",
      "-_id",
    ]);
    const dataInfo = {
      message: "Professions list fetched successfully",
      data: professions,
    };
    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    return next(new AppError(error.message, error.statusCode));
  }
};
