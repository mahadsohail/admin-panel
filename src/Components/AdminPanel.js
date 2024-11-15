import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Paper
} from "@mui/material";

function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    image: null
  });
  const [editingProduct, setEditingProduct] = useState(null); // Track the product being edited

  const fetchProducts = async () => {
    const response = await axios.get("http://localhost:5000/api/products");
    setProducts(response.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async () => {
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("price", newProduct.price);
    formData.append("quantity", newProduct.quantity);
    formData.append("image", newProduct.image); // Upload the image file
  
    try {
      // Send data to backend to add the product
      const response = await axios.post("http://localhost:5000/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
  
      // Add the new product to the list
      setProducts([...products, response.data]);
  
      // Reset new product form
      setNewProduct({ name: "", description: "", price: 0, quantity: 0, image: null });
  
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };
  

  const deleteProduct = async (id) => {
    await axios.delete(`http://localhost:5000/api/products/${id}`);
    setProducts(products.filter((product) => product._id !== id));
  };

  const openEditDialog = (product) => {
    setEditingProduct(product); // Set the product to be edited
  };

  const updateProduct = async () => {
    const formData = new FormData();
    formData.append("name", editingProduct.name);
    formData.append("description", editingProduct.description);
    formData.append("price", editingProduct.price);
    formData.append("quantity", editingProduct.quantity);
    if (editingProduct.image) {
      formData.append("image", editingProduct.image); // Append image if it's changed
    }

    const response = await axios.put(
      `http://localhost:5000/api/products/${editingProduct._id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
    setProducts(products.map((product) => (product._id === editingProduct._id ? response.data : product)));
    setEditingProduct(null); // Close the dialog after updating
  };

  // Handle image selection for new product
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result }); // Set image data URL for preview
      };
      reader.readAsDataURL(file); // Convert file to data URL
    }
  };

  // Handle image change for editing
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({ ...editingProduct, image: reader.result }); // Set image data URL for preview
      };
      reader.readAsDataURL(file); // Convert file to data URL
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Admin Panel
        </Typography>

        {/* Add New Product */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Add New Product
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Price"
                type="number"
                variant="outlined"
                fullWidth
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Quantity"
                type="number"
                variant="outlined"
                fullWidth
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={4}>
              <Button variant="contained" component="label" fullWidth>
                Upload Image
                <input type="file" hidden onChange={handleImageChange} />
              </Button>
            </Grid>
            <Grid item xs={12}>
              {newProduct.image && (
                <Box mt={2}>
                  <img src={newProduct.image} alt="Preview" style={{ width: '100%', height: 'auto' }} />
                </Box>
              )}
            </Grid>
            <Grid item xs={2}>
              <Button variant="contained" color="primary" fullWidth onClick={addProduct}>
                Add
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Display Products */}
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card>
                {product.image && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={product.image}
                    alt={product.name}
                  />
                )}
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography color="text.secondary">{product.description}</Typography>
                  <Typography>Price: ${product.price}</Typography>
                  <Typography>Quantity: {product.quantity}</Typography>
                </CardContent>
                <CardActions>
                  <Button color="error" onClick={() => deleteProduct(product._id)}>
                    Delete
                  </Button>
                  <Button color="primary" onClick={() => openEditDialog(product)}>
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Edit Product Dialog */}
        {editingProduct && (
          <Dialog open={Boolean(editingProduct)} onClose={() => setEditingProduct(null)}>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogContent>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Price"
                type="number"
                variant="outlined"
                fullWidth
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                margin="normal"
              />
              <TextField
                label="Quantity"
                type="number"
                variant="outlined"
                fullWidth
                value={editingProduct.quantity}
                onChange={(e) => setEditingProduct({ ...editingProduct, quantity: Number(e.target.value) })}
                margin="normal"
              />
              <Button variant="contained" component="label" fullWidth>
                Upload Image
                <input type="file" hidden onChange={handleEditImageChange} />
              </Button>
              {editingProduct.image && (
                <Box mt={2}>
                  <img src={editingProduct.image} alt="Preview" style={{ width: '100%', height: 'auto' }} />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditingProduct(null)}>Cancel</Button>
              <Button onClick={updateProduct}>Save</Button>
            </DialogActions>
          </Dialog>
        )}
      </Paper>
    </Container>
  );
}

export default AdminPanel;
