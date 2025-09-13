import React, { useEffect, useState } from "react";
import '../styles/Reporting.css';

const backendURL = "http://localhost:5000";

function Reporting() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockTransactions, setStockTransactions] = useState([]);

  const fetchData = async () => {
    try {
      const resSales = await fetch(`${backendURL}/sales`);
      const salesData = await resSales.json();
      setSales(salesData);

      const resProducts = await fetch(`${backendURL}/products`);
      const productsData = await resProducts.json();
      setProducts(productsData);

      const resStock = await fetch(`${backendURL}/stock-transactions`);
      const stockData = await resStock.json();
      setStockTransactions(stockData);
    } catch (err) {
      console.error("Error fetching reporting data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Total revenue
  const totalRevenue = sales.reduce((sum, s) => sum + (s.price || 0) * s.quantity, 0);

  // Most-selling products
  const productSalesMap = {};
  sales.forEach((s) => {
    productSalesMap[s.productName] = (productSalesMap[s.productName] || 0) + s.quantity;
  });

  const mostSellingProducts = Object.entries(productSalesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // top 5

  const lowStockProducts = products.filter((p) => p.quantity < 10);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Reporting</h1>

      {/* Sales Summary Table */}
      <h2>Sales Summary</h2>
      <table border="1" cellPadding="10" style={{ marginBottom: "20px", width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td>Total Sales Transactions</td>
            <td>{sales.length}</td>
          </tr>
          <tr>
            <td>Total Revenue</td>
          <td>R {Number(totalRevenue).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* Most Selling Products Table */}
      <h2>Most Selling Products</h2>
      <table border="1" cellPadding="10" style={{ marginBottom: "20px", width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f8d7f8" }}>
          <tr>
            <th>Product Name</th>
            <th>Quantity Sold</th>
          </tr>
        </thead>
        <tbody>
          {mostSellingProducts.map(([name, quantity]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{quantity}</td>
            </tr>
          ))}
          {mostSellingProducts.length === 0 && (
            <tr>
              <td colSpan="2" style={{ textAlign: "center" }}>No sales yet</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Low Stock Products Table */}
      <h2>Low Stock Products</h2>
      <table border="1" cellPadding="10" style={{ marginBottom: "20px", width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f8d7f8" }}>
          <tr>
            <th>Product Name</th>
            <th>Quantity Remaining</th>
          </tr>
        </thead>
        <tbody>
          {lowStockProducts.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.quantity}</td>
            </tr>
          ))}
          {lowStockProducts.length === 0 && (
            <tr>
              <td colSpan="2" style={{ textAlign: "center" }}>No low stock products</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Recent Stock Additions Table */}
      <h2>Recent Stock Additions</h2>
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f8d7f8" }}>
          <tr>
            <th>Product Name</th>
            <th>Quantity Added</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {stockTransactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((t) => (
              <tr key={t.id}>
                <td>{t.productName}</td>
                <td>{t.quantity}</td>
                <td>{new Date(t.date).toLocaleString()}</td>
              </tr>
            ))}
          {stockTransactions.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>No stock transactions</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Reporting;
