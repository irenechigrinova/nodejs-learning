const Joi = require('joi');

const permissionSchema = Joi.object({
  value: Joi.string().min(3).max(30).required(),
});

export default permissionSchema;
