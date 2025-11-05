import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  mpesaCheckoutRequestID: {
    type: String,
  },
  mpesaReceiptNumber: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
