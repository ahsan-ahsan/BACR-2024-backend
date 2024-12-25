import User from "../models/User.js";
import Role from "../models/Role.js";
import Module from "../models/Module.js";
import {mixpanel} from "../server.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  // Input Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId: 1,
    });

    // Generate JWT token
    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: "1h" });

    // Send response
    res.status(201).json({
      message: "User created successfully",
      token,
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message || "Something went wrong",
    });
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    // Correctly use the 'where' clause to find the user by email
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: 'role',  // Use the alias defined in the User model association
          include: {
            model: Module,  // Populate modules associated with the role
            as: 'modules',  // Ensure the alias matches the 'as' defined in the Role model
          }
        }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid emavvil or password" });
    }
    // Compare password
    console.log(user.role);
    
    const isPasswordValid=bcrypt.compare(password, user.password).then((result) => {
  console.log("Comparison result:", result);
}).catch((err) => {
  console.error("Error:", err);
});
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid emailcc or password" });
    }

    // Track the user in Mixpanel
    mixpanel.people.set(user.id, {
      $name: user.name,
      $email: user.email
    });

    // Get the role and modules
    const roles = user.role ? user.role.name : 'No role';
    const userModules = user.role ? user.role.Modules : [];
    const modules = userModules.map(module => module.name);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, roles, modules },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message || error });
  }
};
  export const getAllusers = async (req, res) => {
    try {
      const users = await User.find(); // Fetch all users
      res.status(200).json({ users });
    } catch (error) {
      console.error(error); // Log error for detailed debugging
      res.status(500).json({ message: "Error retrieving users", error });
    }
  };