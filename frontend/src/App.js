import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import ProductManagement from "./components/ProductManagement";
import Sales from "./components/Sales";
import Inventory from "./components/Inventory";
import Reporting from "./components/Reporting";
import "./styles/App.css"; // Make sure this exists

function App() {
  const [activeModule, setActiveModule] = useState("Dashboard");

  const renderModule = () => {
    switch (activeModule) {
      case "Dashboard":
        return <Dashboard />;
      case "ProductManagement":
        return <ProductManagement />;
      case "Sales":
        return <Sales />;
      case "Inventory":
        return <Inventory />;
      case "Reporting":
        return <Reporting />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <button className="nav-btn" onClick={() => setActiveModule("Dashboard")}>
          Dashboard
        </button>
        <button className="nav-btn" onClick={() => setActiveModule("ProductManagement")}>
          Products
        </button>
        <button className="nav-btn" onClick={() => setActiveModule("Sales")}>
          Sales
        </button>
        <button className="nav-btn" onClick={() => setActiveModule("Inventory")}>
          Inventory
        </button>
        <button className="nav-btn" onClick={() => setActiveModule("Reporting")}>
          Reporting
        </button>
      </nav>

      <main className="module-container">{renderModule()}</main>

      {/* Footer with Contact Info */}
      <footer className="footer">
        <p>Contact me: phalatsanemolise30@gmail.com | WhatsApp: +26662055361</p>
        <p>© 2025 Wings Cafe Inventory System</p>
      </footer>
    </div>
  );
}

export default App;
