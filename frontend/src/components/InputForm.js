import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function InputForm({ setIsOpen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [checkoutRequestID, setCheckoutRequestID] = useState("");
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPaymentMessage("");

    const endpoint = isSignUp ? "signUp" : "login";

    try {
      const payload = { email, password };
      if (isSignUp) payload.phone = phone;

      const res = await axios.post(`https://food-k1y4.onrender.com/api/user/${endpoint}`, payload);

      if (isSignUp && res.status === 202) {
        setPaymentMessage(`${res.data.message} ${res.data.customerMessage}`);
        setCheckoutRequestID(res.data.checkoutRequestID); // Save payment reference
      } else {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setIsOpen();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "An unexpected error occurred.");
    }
  };

  // Auto-check payment every 5 seconds if there's a checkoutRequestID
  useEffect(() => {
    if (!checkoutRequestID) return;

    const interval = setInterval(async () => {
      setIsCheckingPayment(true);
      try {
        const res = await axios.get(`https://food-k1y4.onrender.com/api/mpesa/status/${checkoutRequestID}`);
        if (res.data.status === "success") {
          // Payment confirmed, log the user in
          const loginRes = await axios.post(`https://food-k1y4.onrender.com/api/user/login`, { email, password });
          localStorage.setItem("token", loginRes.data.token);
          localStorage.setItem("user", JSON.stringify(loginRes.data.user));
          setIsOpen();
          clearInterval(interval); // stop checking after success
        } else {
          setPaymentMessage("Payment not completed yet. Waiting...");
        }
      } catch (err) {
        setError("Failed to confirm payment. Try again.");
      } finally {
        setIsCheckingPayment(false);
      }
    }, 5000); // every 5 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, [checkoutRequestID]);

  return (
    <form className="form" onSubmit={handleOnSubmit}>
      <div className="form-control">
        <label>Email</label>
        <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="form-control">
        <label>Password</label>
        <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>

      {isSignUp && (
        <div className="form-control">
          <label>Phone Number</label>
          <input type="text" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
      )}

      <button type="submit">{isSignUp ? "Sign Up" : "Login"}</button>

      {checkoutRequestID && (
        <h6 className="info">
          {isCheckingPayment ? "Checking payment..." : paymentMessage}
        </h6>
      )}

      {error && <h6 className="error">{error}</h6>}

      <p onClick={() => setIsSignUp(prev => !prev)} style={{ cursor: "pointer" }}>
        {isSignUp ? "Already have an account?" : "Create new account"}
      </p>
    </form>
  );
}
