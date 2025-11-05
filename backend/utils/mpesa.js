import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

const {
  CONSUMER_KEY,
  CONSUMER_SECRET,
  SHORT_CODE,
  PASS_KEY,
  CALLBACK_URL
} = process.env;

export const initiateStkPush = async (phone, amount, accountReference, transactionDesc) => {
  let stkPayload;
  try {
    // Get token
    const tokenResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        auth: { username: CONSUMER_KEY, password: CONSUMER_SECRET },
      }
    );

    const token = tokenResponse.data.access_token;

    const date = new Date();
    const timestamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}`;
    const password = Buffer.from(SHORT_CODE + PASS_KEY + timestamp).toString("base64");

    const formattedPhone = phone.startsWith("254") ? phone : `254${phone.slice(-9)}`;

    stkPayload = {
      BusinessShortCode: SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    };

    console.log("STK Push Payload:", stkPayload);

    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return stkResponse.data;
  } catch (err) {
    console.error("❌ Error initiating STK Push:", err.message);

    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Headers:", err.response.headers);
      console.error("Data:", err.response.data || err.response.statusText);
    }
    else if (err.request) {
      console.error("Request:", err.request);
    } else {
      console.error("Error:", err.message);
    }
    const error = new Error(`M-Pesa STK Push initiation failed: ${err.message}`);
    if (stkPayload) {
      error.payload = stkPayload;
    }
    throw error;
  }
};
