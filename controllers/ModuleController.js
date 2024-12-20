import Module from "../models/Module.js";

export const getModules = async (req, res) => {
  try {
    const modules = await Module.find();
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching modules", error });
  }
};

export const createModule = async (req, res) => {
  const { name, description} = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Module name is required' });
  }
  try {
    const newModule = new Module({ name, description});
    await newModule.save();
    res.status(201).json({ message: 'Module created successfully', module: newModule });
  } catch (error) {
    res.status(500).json({ message: 'Error creating module', error });
  }
};