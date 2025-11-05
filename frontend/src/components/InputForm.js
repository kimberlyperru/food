import React, { useState } from 'react'
import axios from 'axios'

export default function InputForm({setIsOpen}) {
   const [email,setEmail]=useState("")
   const [password,setPassword]=useState("")
   const [phone,setPhone]=useState("") // New state for phone number
   const [isSignUp,setIsSignUp]=useState(false) 
   const [error,setError]=useState("")
   const [paymentMessage, setPaymentMessage] = useState(""); // New state for payment messages

  const handleOnSubmit=async(e)=>{
    e.preventDefault()
    setError(""); // Clear previous errors
    setPaymentMessage(""); // Clear previous payment messages

    let endpoint=(isSignUp) ? "signUp" : "login"
    try {
      const payload = { email, password };
      if (isSignUp) {
        payload.phone = phone;
      }
      const res = await axios.post(`http://localhost:5000/api/user/${endpoint}`, payload);
      
      if (isSignUp && res.status === 202) {
        setPaymentMessage(res.data.message + " " + res.data.customerMessage);
        // Optionally, you might want to store userId or checkoutRequestID in state
      } else {
        localStorage.setItem("token",res.data.token)
        localStorage.setItem("user",JSON.stringify(res.data.user))
        setIsOpen()
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "An unexpected error occurred.");
    }
  }

  return (
    <>
        <form className='form' onSubmit={handleOnSubmit}>
            <div className='form-control'>
                <label>Email</label>
                <input type="email" className='input' onChange={(e)=>setEmail(e.target.value)} required></input>
            </div>
            <div className='form-control'>
                <label>Password</label>
                <input type="password" className='input' onChange={(e)=>setPassword(e.target.value)} required></input>
            </div>
            {isSignUp && (
              <div className='form-control'>
                  <label>Phone Number</label>
                  <input type="text" className='input' onChange={(e)=>setPhone(e.target.value)} required></input>
              </div>
            )}
            <button type='submit'>{(isSignUp) ? "Sign Up": "Login"}</button><br></br>
          { (error!="") && <h6 className='error'>{error}</h6>}<br></br>
          { (paymentMessage!="") && <h6 className='info'>{paymentMessage}</h6>}<br></br>
            <p onClick={()=>setIsSignUp(pre=>!pre)}>{(isSignUp) ? "Already have an account": "Create new account"}</p>
        </form>
    </>
  )
}