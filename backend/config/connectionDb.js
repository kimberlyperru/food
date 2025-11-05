import mongoose from "mongoose";

const connectDb=async()=>{
    try {
        await mongoose.connect(process.env.CONNECTION_STRING)
        console.log("✅ Database connected successfully!")
    } catch (error) {
        console.error("❌ Database connection failed:", error.message)
        process.exit(1) // Exit the process with a failure code
    }
}

export default connectDb;

