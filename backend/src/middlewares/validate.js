import z, { ZodError } from "zod";

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedError = z.flattenError(error);
      res.status(400).json({ message: formattedError });
    }
  }
};

export default validate;
