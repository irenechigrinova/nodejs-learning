const Joi = require('joi');

const userGroupSchema = Joi.object({
  usersIds: Joi.array().items(Joi.number()).required(),
  groupId: Joi.number(),
});

export default userGroupSchema;
