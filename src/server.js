const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Configure Multer for storing uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set upload folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set filename as timestamp + file extension
  },
});
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/admin-panel", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  quantity: Number,
  image: String, // Path to uploaded image
});

const Product = mongoose.model("Product", productSchema);

// Login route (for authentication)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "rayyan" && password === "rayyan123") {
    res.json({ success: true, token: "admin-token" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Product routes

// Route to get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
});

// Route to add a new product (with image upload)
app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : ""; // Set image path

    // Validate product data
    if (!name || !description || !price || !quantity) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Create a new product
    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      image,
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding product" });
  }
});

// Route to update an existing product
app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

    // Find the product by ID and update it
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, quantity, image },
      { new: true } // Return the updated product
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating product" });
  }
});

// Route to delete a product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
});

// Serve static files from "uploads" folder for image access
app.use("/uploads", express.static("uploads"));

// Start the server
app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
