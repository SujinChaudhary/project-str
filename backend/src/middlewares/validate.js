import z, { ZodError } from "zod";

const validate = (schema, source = "body") => (req, res, next) => {
  try {
    const parsed = schema.parse(req[source]);

    if (source === "query") {
      Object.assign(req.query, parsed);
    } else {
      req[source] = parsed;
    }
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedError = z.flattenError(error);
      res.status(400).json({ success: false, message: formattedError });
    }
    next(error);
  }
};

export default validate;