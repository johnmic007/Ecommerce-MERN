const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require("dotenv").config();

const PORT = process.env.PORT || 8080;
const MONGODB_URL = process.env.MONGODB_URL;

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Database connection
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 13000,
  socketTimeoutMS: 5000,
})
  .then(() => console.log("Connected to database"))
  .catch(err => console.error("Database connection error:", err));

// Define schemas and models
const productSchema = mongoose.Schema({
  name: String,
  category: String,
  image: String,
  price: String,
  description: String,
});
const productModel = mongoose.model("product", productSchema);

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  confirmPassword: String,
  image: String,
});
const userModel = mongoose.model("user", userSchema);

// Routes

// Home route
app.get('/', (req, res) => {
  res.send("Server is running.....");
});

// Upload a product
app.post("/uploadProduct", async (req, res) => {
  try {
    const newData = new productModel(req.body);
    await newData.save();
    res.json({ message: "Upload successful" });
  } catch (error) {
    console.error("Upload product error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get products
app.get("/product", async (req, res) => {
  try {
    const data = await productModel.find({});
    res.json(data);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// User signup
app.post("/signup", async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.json({ message: "Email is already registered" });
    }
    const newUser = new userModel(req.body);
    await newUser.save();
    res.json({ message: "Successfully registered" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// User login
app.post("/login", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await userModel.findOne({ email: email });
    if (result) {
      const dataSend = {
        _id: result._id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        image: result.image,
      };
      res.json({ message: "Logged in successfully", alert: true, data: dataSend });
    } else {
      res.json({ message: "Email not found, please sign up", alert: false });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
