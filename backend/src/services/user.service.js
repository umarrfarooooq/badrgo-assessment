const User = require("../models/User.model");
const { conflictError } = require("../utils/errors");

const createUser = async (userFields) => {
  try {
    const user = await User.create(userFields);
    return user;
  } catch (error) {
    if (error.code === 11000) {
      throw conflictError("Email already exists");
    }
    throw error;
  }
};

const listUsers = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(),
  ]);

  return {
    users,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
};

module.exports = {
  createUser,
  listUsers,
};
