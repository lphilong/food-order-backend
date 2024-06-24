import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
export const validateUserRequest = [
  body("name").isString().isEmpty().withMessage("Name must be a string"),
  body("addressLine1")
    .isString()
    .isEmpty()
    .withMessage("AddressLine1 must be a string"),
  body("city").isString().isEmpty().withMessage("City must be a string"),
  body("country").isString().isEmpty().withMessage("Country must be a string"),
  handleValidationErrors,
];
