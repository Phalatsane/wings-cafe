import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";

const backendURL = "http://localhost:5000";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  const fetchData = async () => {
    try {
      const resProducts = await fetch(`${backendURL}/products`);
      setProducts(await resProducts.json());

      const resSales = await fetch(`${backendURL}/sales`);
      setSales(await resSales.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.quantity < 10).length;
  const totalSales = sales.length;

  return (
    <div className="dashboard">
      <h1>Dashboard </h1>

      <div className="dashboard-cards">
        <div className="card">
          <h2>Total Products</h2>
          <p>{totalProducts}</p>
        </div>
        <div className="card">
          <h2>Low Stock</h2>
          <p>{lowStock}</p>
        </div>
        <div className="card">
          <h2>Total Sales</h2>
          <p>{totalSales}</p>
        </div>
      </div>

      <h2>Products</h2>
      <div className="products">
        {products.map((p) => (
          <div className="product-card" key={p.id}>
            <img src={p.image} alt={p.name} />
            <h3>{p.name}</h3>
            <p>Price: R {Number(p.price).toFixed(2)}</p>
            <p>Quantity: {p.quantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
