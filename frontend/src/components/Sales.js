import React, { useState, useEffect } from "react";

const backendURL = "http://localhost:5000";

function Sales() {
  const [products, setProducts] = useState([]);
  const [salesLog, setSalesLog] = useState([]);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch products and sales
  const fetchProducts = async () => {
    const res = await fetch(`${backendURL}/products`);
    const data = await res.json();
    setProducts(data);
  };

  const fetchSales = async () => {
    const res = await fetch(`${backendURL}/sales`);
    const data = await res.json();
    setSalesLog(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or update sale
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity) return alert("Fill all fields");

    if (editingId) {
      // Update sale
      const res = await fetch(`${backendURL}/sales/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.status !== 200) return alert(result.error);
    } else {
      // Add sale
      const res = await fetch(`${backendURL}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.status !== 200) return alert(result.error);
    }

    setFormData({ productId: "", quantity: "" });
    setEditingId(null);
    fetchProducts();
    fetchSales();
  };

  // Edit sale
  const handleEdit = (sale) => {
    setFormData({
      productId: sale.productId,
      quantity: sale.quantity,
    });
    setEditingId(sale.id);
  };

  // Delete sale
  const handleDelete = async (id) => {
    const res = await fetch(`${backendURL}/sales/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (res.status !== 200) return alert(result.error);
    fetchProducts();
    fetchSales();
  };

  return (
    <div className="sales">
      <h1>Sales</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <select
          name="productId"
          value={formData.productId}
          onChange={handleChange}
          required
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (Stock: {p.quantity})
            </option>
          ))}
        </select>
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
          min="1"
        />
        <button type="submit">{editingId ? "Update Sale" : "Record Sale"}</button>
      </form>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {salesLog.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.productName}</td>
              <td>{sale.quantity}</td>
                  <td>R {Number(sale.price).toFixed(2)}</td>
              <td>{(sale.price * sale.quantity).toFixed(2)}</td>
              <td>{new Date(sale.date).toLocaleString()}</td>
              <td>
                <button onClick={() => handleEdit(sale)}>Edit</button>
                <button onClick={() => handleDelete(sale.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Sales;
