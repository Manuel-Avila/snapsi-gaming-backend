export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const dataToValidate = req[source];

    if (
      source === "body" &&
      (!dataToValidate || Object.keys(dataToValidate).length === 0)
    ) {
      return res.status(400).json({ message: "The request is empty." });
    }

    const { error, value } = schema.validate(dataToValidate);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    Object.assign(req[source], value);
    next();
  };
};

export default validate;
