const Joi = require('joi');

const groupPutSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  permissionsIds: Joi.array().items(Joi.number()),
});

export default groupPutSchema;
