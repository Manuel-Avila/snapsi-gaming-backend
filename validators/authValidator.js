import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string()
    .min(5)
    .max(50)
    .regex(/^[a-zA-Z0-9.-]*$/)
    .required()
    .messages({
      "string.base": `"username" must be a string`,
      "string.min": `"username" must have at least {#limit} characters`,
      "string.max": `"username" cannot have more than {#limit} characters`,
      "string.pattern.base": `"username" can only contain letters, numbers, hyphens (-), and periods (.)`,
      "any.required": `"username" is required`,
    }),

  name: Joi.string().min(3).max(255).required().messages({
    "string.base": `"name" must be a string`,
    "string.min": `"name" must have at least {#limit} characters`,
    "string.max": `"name" cannot have more than {#limit} characters`,
    "any.required": `"name" is required`,
  }),

  email: Joi.string().email().max(255).required().messages({
    "string.base": `"email" must be a string`,
    "string.email": `"email" must be a valid email address`,
    "string.max": `"email" cannot have more than {#limit} characters`,
    "any.required": `"email" is required`,
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": `"password" must be a string`,
    "string.min": `"password" must have at least {#limit} characters`,
    "any.required": `"password" is required`,
  }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": `"confirmPassword" must be the same as "password"`,
    "any.required": `"confirmPassword" is required`,
  }),

  gender: Joi.string().valid("male", "female", "other").required().messages({
    "string.base": `"gender" must be a string`,
    "any.required": `"gender" is required`,
    "any.only": `"gender" must be one of the following: "male", "female", or "other"`,
  }),

  age: Joi.number().integer().min(0).max(125).required().messages({
    "number.base": `"age" must be a number`,
    "number.min": `"age" cannot be less than {#limit}`,
    "number.max": `"age" cannot be greater than {#limit}`,
    "any.required": `"age" is required`,
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().max(255).required().messages({
    "string.base": `"email" must be a string`,
    "string.email": `"email" must be a valid email address`,
    "string.max": `"email" cannot have more than {#limit} characters`,
    "any.required": `"email" is required`,
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": `"password" must be a string`,
    "string.min": `"password" must have at least {#limit} characters`,
    "any.required": `"password" is required`,
  }),
});
