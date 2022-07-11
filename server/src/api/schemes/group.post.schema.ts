const Joi = require('joi');

const groupPostSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  permissionsIds: Joi.array().items(Joi.number()).required(),
});

export default groupPostSchema;
