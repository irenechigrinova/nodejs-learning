const UserRepo = require('../repository/user-repository');
const UserDBModel = require('../models/user-model');

module.exports = () => new UserRepo(new UserDBModel());
