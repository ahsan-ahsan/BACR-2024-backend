import Client from "../models/Client.js";
import multer from "multer";
import path from "path";

// Configure multer for file uploads with a 1MB size limit
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/clients");  // Directory for storing uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },  // 1MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, JPG, PNG) are allowed"));
    }
  }
}).single("image");  // Expecting a single file upload with field name "image"

// Create a new client
export const createClient = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }

    const { name } = req.body;
    let image;
    if(req.file){
    image = req.file.path;
    }
    if (!name) {
      return res.status(400).json({ message: "Name and image are required" });
    }
    const existingClient = await Client.findOne({ name });
    if (existingClient) {
      return res.status(404).json({ message: 'Name already exists' });
    }
    try {
      const client = new Client({
        name,
        imagePath: image
      });

      await client.save();
      res.status(201).json({ message: "Client created successfully", client });
    } catch (error) {
      res.status(500).json({ message: "Error saving client", error });
    }
  });
};

// Get all clients
export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    const clientsWithCorrectImagePath = clients.map(client => {
      const correctImagePath = client.imagePath ? client.imagePath.replace(/\\+/g, '/'): null;
      return {
        ...client.toObject(),
        imagePath: `http://localhost:3000/${correctImagePath}`
      };
    });
    res.status(200).json({ clients: clientsWithCorrectImagePath });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving clients", error });
  }
};

// Get a single client by ID
export const getClientById = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json({ client });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving client", error });
  }
};

// Update client information by ID
export const updateClient = async (req, res) => {
  const { id } = req.params;

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }

    const { name } = req.body;
    const image = req.file;

    const updateData = {};
    if (name) updateData.name = name;
    if (image) updateData.imagePath = image.path;

    try {
      const updatedClient = await Client.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(200).json({ message: "Client updated successfully", updatedClient });
    } catch (error) {
      res.status(500).json({ message: "Error updating client", error });
    }
  });
};

// Delete a client by ID
export const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedClient = await Client.findByIdAndDelete(id);
    if (!deletedClient) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client", error });
  }
};
