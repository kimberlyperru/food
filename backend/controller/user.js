import User from "../models/user.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { initiateStkPush } from "../utils/mpesa.js";

export const userSignUp = async (req, res) => {
  const { email, password, phone } = req.body;
  if (!email || !password || !phone) {
    return res.status(400).json({ message: "Email, password, and phone are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    return res.status(400).json({ error: "Phone number already exists" });
  }

  const hashedPwd = await bcryptjs.hash(password, 10);
  const newUser = await User.create({ email, password: hashedPwd, phone, isPaid: false });

  try {
    const amount = 50; // Ksh 50
    const accountReference = "FoodAppSignup";
    const transactionDesc = "First-time signup payment";

    const stkResponse = await initiateStkPush(phone, amount, accountReference, transactionDesc);

    // Store CheckoutRequestID for later verification in the callback
    newUser.mpesaCheckoutRequestID = stkResponse.CheckoutRequestID;
    await newUser.save();

    return res.status(202).json({
      message: "User created. Please complete the M-Pesa payment to activate your account.",
      userId: newUser._id,
      checkoutRequestID: stkResponse.CheckoutRequestID,
      customerMessage: stkResponse.CustomerMessage,
    });
  } catch (paymentError) {
    console.error("M-Pesa STK Push initiation failed:", paymentError.message);
    // If STK push fails, we might want to delete the user or mark them for manual review
    await User.findByIdAndDelete(newUser._id);
    const errorResponse = { error: `Failed to initiate payment: ${paymentError.message}` };
    if (paymentError.payload) {
      errorResponse.payload = paymentError.payload;
    }
    return res.status(500).json(errorResponse);
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  if (!user.isPaid) {
    return res.status(403).json({ error: "Account not activated. Please complete the payment." });
  }

  if (user && (await bcryptjs.compare(password, user.password))) {
    const token = jwt.sign(
      { email, id: user._id },
      process.env.SECRET_KEY
    );
    return res.status(200).json({ token, user });
  } else {
    return res.status(400).json({ error: "Invalid credentials" });
  }
};

export const getUser = async (req, res) => {
  const userId = req.params.id;
  console.log(`Attempting to find user with ID: ${userId}`);
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User with ID: ${userId} not found.`);
      return res.status(404).json({ message: `User with ID ${userId} not found.` });
    }
    res.json({ email: user.email });
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error.message);
    res.status(500).json({ message: "Internal server error while fetching user." });
  }
};
