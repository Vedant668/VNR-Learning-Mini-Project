import mongoose, { Schema } from "mongoose";
const adminSchema = new Schema({
   "Name":String,
   "Username":String,
   "Password":String,
   "Gender":String,
   "Phone":String,
   "Email":String
});
export const Admin=mongoose.model('admin',adminSchema);