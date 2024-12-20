import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true , unique: true },
  imagePath: { type: String}
}, { timestamps: true });

export default mongoose.model("Client", clientSchema);