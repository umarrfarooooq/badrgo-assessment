const userService = require("../services/user.service");

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await userService.listUsers({ page, limit });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  listUsers,
};
