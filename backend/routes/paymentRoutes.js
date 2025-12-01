import express from "express";
import { initiateStkPush } from "../utils/mpesa.js";
import User from "../models/user.js";

const router = express.Router();

router.post("/stkpush", async (req, res) => {
  const { phone, amount, accountReference, transactionDesc, email } = req.body;

  try {
    const stkResponse = await initiateStkPush(phone, amount, accountReference, transactionDesc);
    
    // Save the CheckoutRequestID to the user
    const user = await User.findOne({ email });
    if (user) {
      user.mpesaCheckoutRequestID = stkResponse.CheckoutRequestID;
      await user.save();
    }
    
    res.json(stkResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment failed", details: err.message });
  }
});

router.get("/status/:checkoutRequestID", async (req, res) => {
  const { checkoutRequestID } = req.params;

  try {
    const user = await User.findOne({ mpesaCheckoutRequestID: checkoutRequestID });

    if (!user) {
      return res.status(404).json({ status: "pending" }); // must have "status" field
    }

    if (user.isPaid) {
      return res.json({ status: "success" }); // frontend expects "success"
    } else {
      return res.json({ status: "pending" });
    }
  } catch (error) {
    console.error("Error getting payment status:", error);
    res.status(500).json({ status: "pending" });
  }
});

router.post("/callback", async (req, res) => {
  try {
    const callbackData = req.body.Body.stkCallback;
    const { CheckoutRequestID, ResultCode, ResultDesc, MpesaReceiptNumber } = callbackData;

    console.log("M-Pesa Callback Received:", callbackData);

    const user = await User.findOne({ mpesaCheckoutRequestID: CheckoutRequestID });

    if (!user) {
      console.error("User not found for CheckoutRequestID:", CheckoutRequestID);
      return res.json({ message: "User not found" });
    }

    if (ResultCode === 0) {
      user.isPaid = true;
      user.mpesaReceiptNumber = MpesaReceiptNumber;
      await user.save();
      console.log(`Payment successful for user ${user.email}. Receipt: ${MpesaReceiptNumber}`);
    } else {
      console.log(`Payment failed for user ${user.email}. ResultCode: ${ResultCode}, Desc: ${ResultDesc}`);
      // Optionally, handle failed payments (e.g., notify user, retry payment)
    }

    res.json({ message: "Callback received successfully" });
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
