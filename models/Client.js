import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  sr_no: { type: Number, required: true},
  name: { type: String, required: true , unique: true },
  imagePath: { type: String}
}, { timestamps: true });

export default mongoose.model("Client", clientSchema);