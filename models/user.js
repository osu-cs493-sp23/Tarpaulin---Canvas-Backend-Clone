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
    set(value) {
      this.setDataValue("password", bcrpyt.hashSync(value, 8));
    },
  },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: false },
  admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
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
  role,
  admin
) {
  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return {
        error: "Email address already exists.",
      };
    }
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      admin
    });
    return newUser;
  } catch (error) {
    console.error("Error creating a new user:", error);
    return {
      error: "Failed to create a new user.",
    };
  }
};
exports.createNewUser = createNewUser;

const getUserById = async function getUserById(id, includePassword) {
  try {
    const user = await User.findByPk(id, {
      attributes: includePassword ? {} : { exclude: ["password"] },
    });
    if (user) {
      return user;
    }
  } catch (error) {
    return {
      error: `User with id ${id} does not exist`,
    };
  }
};
exports.getUserById = getUserById;

const validateUser = async function validateUser(id, email, password) {
  const user = await getUserById(id, true, true);
  return (
    user &&
    email === user.email &&
    (await bcrpyt.compare(password, user.password))
  );
};
exports.validateUser = validateUser;