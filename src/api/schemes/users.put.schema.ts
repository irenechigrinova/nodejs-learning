const Joi = require('joi');

const userPutSchema = Joi.object({
  login: Joi.string().min(3).max(30),
  password: Joi.string().pattern(/^.*(?=.{4,10})(?=.*\d)(?=.*[a-zA-Z]).*$/),
  age: Joi.number().integer().min(4).max(130),
});

export default userPutSchema;
