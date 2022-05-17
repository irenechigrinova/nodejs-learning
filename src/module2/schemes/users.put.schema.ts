const Joi = require('joi');

export {};

module.exports = Joi.object({
  id: Joi.string().required(),
  login: Joi.string().min(3).max(30),
  password: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/),
  age: Joi.number().integer().min(4).max(130),
});
