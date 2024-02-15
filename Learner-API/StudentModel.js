import mongoose, { Schema } from "mongoose";

const studentSchema=new Schema({
    "Name":String,
    "Username":String,
    "Password":String,
    "Gender":String,
    "Phone":Number,
    "Email":String
});

export const Student=mongoose.model("student",studentSchema);