const validateSchema = (schema) => (req, res, next) => {
  const { error, value } = schema.validate({
    ...req.body,
    ...req.params,
    ...req.query,
  });

  if (error) {
    return error.details.forEach((e) => {
      res.status(400).json({ message: e.message.replace(/['"]/g, "") });
    });
  }

  next();
};

const validateBodySchema = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return returnValidationError(error, res);
  }

  next();
};

const validateParamSchema = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.params);
  if (error) {
    return returnValidationError(error, res);
  }

  next();
};

const validateQuerySchema = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query);
  if (error) {
    return returnValidationError(error, res);
  }
  next();
};

const formatError = (allErrors) => {
  const errors = [];
  allErrors.details.forEach((error) => {
    errors.push(error.message.replace(/['"]+/g, ""));
  });
  return errors;
};

const returnValidationError = (error, res) => {
  const validationErrors = formatError(error);
  return res.status(400).json({ status: "error", message: validationErrors });
};

module.exports = {
  validateBodySchema,
  validateParamSchema,
  validateQuerySchema,
  validateSchema,
};
