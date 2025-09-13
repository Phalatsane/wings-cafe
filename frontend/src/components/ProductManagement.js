import React, { useState, useEffect } from "react";

const backendURL = "http://localhost:5000";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    image: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch products from backend
  const fetchProducts = async () => {
    const res = await fetch(`${backendURL}/products`);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      // Update
      const res = await fetch(`${backendURL}/products/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      await res.json();
    } else {
      // Add
      const res = await fetch(`${backendURL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      await res.json();
    }

    setFormData({
      name: "",
      description: "",
      category: "",
      price: "",
      quantity: "",
      image: "",
    });
    setEditingId(null);
    fetchProducts();
  };

  // Edit product
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      image: product.image,
    });
    setEditingId(product.id);
  };

  // Delete product
  const handleDelete = async (id) => {
    const res = await fetch(`${backendURL}/products/${id}`, { method: "DELETE" });
    await res.json();
    fetchProducts();
  };

  return (
    <div className="product-management">
      <h1>Product Management</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="image"
          placeholder="Image URL (e.g., src/assets/image.png)"
          value={formData.image}
          onChange={handleChange}
        />
        <button type="submit">{editingId ? "Update Product" : "Add Product"}</button>
      </form>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>{p.category}</td>
              <td>R {Number(p.price).toFixed(2)}</td>
              <td>{p.quantity}</td>
              <td>
                {p.image && <img src={p.image} alt={p.name} width="50" />}
              </td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductManagement;
