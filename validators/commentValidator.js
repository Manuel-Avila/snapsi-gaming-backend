import Joi from "joi";

export const createCommentSchema = Joi.object({
  comment_text: Joi.string().trim().min(1).max(300).required().messages({
    "string.base": `"comment_text" must be text.`,
    "string.empty": `"comment_text" cannot be empty.`,
    "string.min": `"comment_text" must be at least {#limit} character long.`,
    "string.max": `"comment_text" cannot be longer than {#limit} characters.`,
    "any.required": `"comment_text" is required.`,
  }),
});

export const getCommentsSchema = Joi.object({
  limit: Joi.number().integer().min(1).optional().default(10),
  cursor: Joi.string().allow("").optional(),
}).unknown(true);
