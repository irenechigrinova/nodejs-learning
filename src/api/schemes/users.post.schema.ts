const Joi = require('joi');

const userPostSchema = Joi.object({
  login: Joi.string().min(3).max(30).required(),
  password: Joi.string()
    .pattern(/^.*(?=.{4,10})(?=.*\d)(?=.*[a-zA-Z]).*$/)
    .required(),
  age: Joi.number().integer().min(4).max(130).required(),
});

export default userPostSchema;
