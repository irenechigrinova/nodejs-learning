const Joi = require('joi');

const usersAddToGroupSchema = Joi.object({
  usersIds: Joi.array()?.required(),
  groupId: Joi.number(),
});

export default usersAddToGroupSchema;
