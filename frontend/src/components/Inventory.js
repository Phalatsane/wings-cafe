import React, { useEffect, useState } from "react";
import '../styles/Inventory.css';

const backendURL = "http://localhost:5000";

function Inventory() {
  const [products, setProducts] = useState([]);
  const [stockTransactions, setStockTransactions] = useState([]);
  const [stockInputs, setStockInputs] = useState({});

  const fetchData = async () => {
    try {
      const resProducts = await fetch(`${backendURL}/products`);
      const dataProducts = await resProducts.json();
      setProducts(dataProducts);

      const resStock = await fetch(`${backendURL}/stock-transactions`);
      const dataStock = await resStock.json();
      setStockTransactions(dataStock);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStockChange = (productId, value) => {
    setStockInputs({
      ...stockInputs,
      [productId]: value
    });
  };

  const addStock = async (productId) => {
    const quantity = Number(stockInputs[productId]);
    if (!quantity || quantity <= 0) return alert("Enter a valid quantity");

    try {
      const res = await fetch(`${backendURL}/products/${productId}/add-stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity })
      });
      const data = await res.json();
      if (res.ok) {
        fetchData(); // refresh products and stock transactions
        setStockInputs({ ...stockInputs, [productId]: "" }); // clear input
      } else {
        alert(data.error || "Failed to add stock");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="inventory" style={{ padding: "20px" }}>
      <h1>Inventory</h1>

      {/* Products Table */}
      <table className="inventory-table" border="1" cellPadding="10" style={{ width: "100%", marginBottom: "40px", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#ffe4e1" }}>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Add Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
                <td>R {Number(product.price).toFixed(2)}</td>
              <td>{product.quantity}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={stockInputs[product.id] || ""}
                  onChange={(e) => handleStockChange(product.id, e.target.value)}
                  style={{ width: "80px", marginRight: "5px" }}
                />
                <button onClick={() => addStock(product.id)}>Add</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Stock Additions History */}
      <h2>Stock Additions History</h2>
      <table className="stock-history-table" border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#ffe4e1" }}>
          <tr>
            <th>Product</th>
            <th>Quantity Added</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {stockTransactions.map((t) => (
            <tr key={t.id}>
              <td>{t.productName}</td>
              <td>{t.quantity}</td>
              <td>{new Date(t.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventory;
