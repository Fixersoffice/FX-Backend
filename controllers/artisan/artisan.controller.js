const Artisan = require("../../models/artisan.model");
const { successResMsg } = require("../../utils/libs/response");
const AppError = require("../../utils/libs/appError");

exports.createArtisan = async (req, res, next) => {
  const { artisanType } = req.body;
  const newArtisan = await Artisan.create({ artisanType });
  try {
    await newArtisan.save();
    const dataInfo = {
      message: "Artisan created successfully",
      data: newArtisan,
    };
    return successResMsg(res, 201, dataInfo);
  } catch (error) {
    console.log(error);
    return next(new AppError(error.message, error.statusCode));
  }
};

// fetch list of professions
exports.listArtisans = async (req, res, next) => {
  try {
    const artisans = await Artisan.find().select([
      "-__v",
      "-createdAt",
      "-updatedAt",
      "-_id",
    ]);
    const dataInfo = {
      message: "Artisans list fetched successfully",
      data: artisans,
    };
    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    return next(new AppError(error.message, error.statusCode));
  }
};
