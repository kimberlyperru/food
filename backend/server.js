import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paymentRoutes from "./routes/paymentRoutes.js";
import connectDb from "./config/connectionDb.js";
import userRoutes from "./routes/user.js";
import recipeRoutes from "./routes/recipe.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDb();

app.use(express.json());

  app.use(cors(
  // origin: "https://foodrecipe-v0x1.onrender.com/", // React dev server
  // credentials: true
));


app.use(express.static("public"));

// Routes
app.use("/api/mpesa", paymentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/recipe", recipeRoutes);

app.get("/", (req, res) => {
  res.send("✅ M-Pesa API running...");
});

import listEndpoints from "express-list-endpoints";

console.log("✅ Registered routes:");
console.table(listEndpoints(app));

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
