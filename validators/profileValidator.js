import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    "string.base": `"name" must be a string`,
    "string.min": `"name" must have at least {#limit} characters`,
    "string.max": `"name" cannot have more than {#limit} characters`,
    "any.required": `"name" is required`,
  }),

  bio: Joi.string().max(500).optional().allow("", null).messages({
    "string.base": `"bio" must be a string`,
    "string.max": `"bio" cannot have more than {#limit} characters`,
  }),
});
