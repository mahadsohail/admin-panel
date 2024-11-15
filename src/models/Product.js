const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  quantity: Number,
  image: String, // Store the image URL or path
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
