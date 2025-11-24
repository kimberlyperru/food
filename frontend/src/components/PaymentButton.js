import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PaymentButton({ amount }) {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");

  const handlePayment = async () => {
    const phone = prompt("Enter your Safaricom number (e.g. 2547XXXXXXXX):");
    const email = localStorage.getItem("email");

    try {
      const res = await axios.post("https://food-k1y4.onrender.com/api/mpesa/stkpush", {
        phone,
        amount,
        email,
      });

      const checkoutRequestID = res.data.CheckoutRequestID;
      setPaymentMessage("Check your phone to complete the payment.");

      // Start polling for payment status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await axios.get(
            `https://food-k1y4.onrender.com/api/mpesa/status/${checkoutRequestID}`
          );
          if (statusRes.data.isPaid) {
            setPaymentStatus("success");
            setPaymentMessage("Payment successful!");
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error(err);
          setPaymentStatus("error");
          setPaymentMessage("Payment failed. Please try again.");
          clearInterval(pollInterval);
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      setPaymentStatus("error");
      setPaymentMessage("Payment failed. Please try again.");
    }
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={paymentStatus === "success"}>
        {paymentStatus === "success" ? "Paid" : `Pay Ksh ${amount} with M-Pesa`}
      </button>
      {paymentMessage && <p>{paymentMessage}</p>}
    </div>
  );
}
