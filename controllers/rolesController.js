import User from "../models/User.js";
import Role from "../models/Role.js";


export const getRoles = async (req, res) => {
    try {
      const roles = await Role.find({
        name: { $nin: ["admin", "superadmin"] }, // Exclude admin and superadmin
      });
        res.status(200).json(roles);
      } catch (error) {
        res.status(500).json({ message: "Error fetching roles", error });
      }
  };

  export const createRole = async (req, res) => {
    const { name, email, message } = req.body;
  
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const contact = new Contact({ name, email, message });
      await contact.save();
      res.status(201).json({ message: 'Contact message saved successfully', contact });
    } catch (error) {
      res.status(500).json({ message: 'Error saving contact message', error: error.message || error  });
    }
  };

  export const getRoleById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const role = await Role.findById(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.status(200).json({ role });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving role", error });
    }
  };