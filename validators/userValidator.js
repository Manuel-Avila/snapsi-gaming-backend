import Joi from "joi";

export const usernameParamSchema = Joi.object({
  username: Joi.string().min(5).max(50).required().messages({
    "string.base": `"username" must be a string`,
    "string.min": `"username" must have at least {#limit} characters`,
    "string.max": `"username" cannot have more than {#limit} characters`,
    "any.required": `"username" is required`,
  }),
});

export const userIdParamSchema = Joi.object({
  userId: Joi.number().integer().positive().required().messages({
    "number.base": `"postId" must be a number`,
    "number.integer": `"postId" must be an integer`,
    "number.positive": `"postId" must be a positive number`,
    "any.required": `"postId" is required`,
  }),
});
