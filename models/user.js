const { DataTypes } = require("sequelize");
const sequelize = require("../lib/sequelize");
const { Submission } = require("./submission");
const bcrpyt = require("bcryptjs");
const User = sequelize.define("user", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: false },
});

User.hasMany(Submission, { foreignKey: { allowNull: false } });
Submission.belongsTo(User);

exports.User = User;

/*
 * Export an array containing the names of fields the client is allowed to set
 * on users.
 */
exports.UserClientFields = ["name", "email", "password", "role"];

const createNewUser = async function createNewUser(
  name,
  email,
  password,
  role
) {
  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return {
        error: "Email address already exists.",
      };
    }
    // Create a new user
    // const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = await User.create({
      name,
      email,
      password,
      role,
    });
    return newUser;
  } catch (error) {
    return {
      error: "Failed to create a new user.",
    };
  }
};
exports.createNewUser = createNewUser;