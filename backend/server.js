// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup: allow frontend URL or all during development
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: FRONTEND_URL === '*' ? true : FRONTEND_URL,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');

// --- Helper functions ---
const readDB = async () => {
  if (!(await fs.pathExists(dbPath))) {
    await fs.writeJson(dbPath, { products: [], transactions: [], stockTransactions: [] }, { spaces: 2 });
  }
  const data = await fs.readJson(dbPath);
  return {
    products: data.products || [],
    transactions: data.transactions || [],
    stockTransactions: data.stockTransactions || []
  };
};

const writeDB = async (data) => {
  await fs.writeJson(dbPath, data, { spaces: 2 });
};

// --- ROOT ROUTE ---
app.get('/', (req, res) => {
  res.send('Welcome to Wings Cafe Backend API 🚀');
});

// --- COMBINED API FOR DASHBOARD ---
app.get('/api/data', async (req, res) => {
  try {
    const data = await readDB();
    res.json({ products: data.products, transactions: data.transactions });
  } catch (err) {
    console.error('/api/data error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- PRODUCTS ---
app.get('/products', async (req, res) => {
  const data = await readDB();
  res.json(data.products);
});

app.post('/products', async (req, res) => {
  const data = await readDB();
  const { name, description, category, price = 0, quantity = 0, image = '' } = req.body;
  const id = Date.now().toString();
  const newProduct = { id, name, description, category, price: Number(price), quantity: Number(quantity), image };
  data.products.push(newProduct);
  await writeDB(data);
  res.json({ message: 'Product added', product: newProduct });
});

app.patch('/products/:id', async (req, res) => {
  const data = await readDB();
  const product = data.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  product.name = req.body.name ?? product.name;
  product.description = req.body.description ?? product.description;
  product.category = req.body.category ?? product.category;
  if (req.body.price !== undefined) product.price = Number(req.body.price);
  if (req.body.quantity !== undefined) product.quantity = Number(req.body.quantity);
  if (req.body.image !== undefined) product.image = req.body.image;

  await writeDB(data);
  res.json({ message: 'Product updated', product });
});

app.delete('/products/:id', async (req, res) => {
  const data = await readDB();
  data.products = data.products.filter(p => p.id !== req.params.id);
  await writeDB(data);
  res.json({ message: 'Product deleted' });
});

// --- STOCK ADDITIONS ---
app.patch('/products/:id/add-stock', async (req, res) => {
  try {
    const data = await readDB();
    const product = data.products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const quantity = Number(req.body.quantity);
    if (isNaN(quantity) || quantity <= 0) return res.status(400).json({ error: 'Invalid quantity' });

    product.quantity += quantity;

    const stockTransaction = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      quantity,
      date: new Date().toISOString()
    };
    data.stockTransactions.push(stockTransaction);

    await writeDB(data);
    res.json({ message: 'Stock added', stockTransaction });
  } catch (err) {
    console.error('add-stock error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/stock-transactions', async (req, res) => {
  try {
    const data = await readDB();
    res.json(data.stockTransactions || []);
  } catch (err) {
    console.error('stock-transactions error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- SALES ---
app.get('/sales', async (req, res) => {
  const data = await readDB();
  const sales = data.transactions.map(t => {
    const product = data.products.find(p => p.id === t.productId);
    return { ...t, productName: product ? product.name : 'Unknown', price: product ? product.price : 0 };
  });
  res.json(sales);
});

app.post('/sales', async (req, res) => {
  const { productId, quantity } = req.body;
  const data = await readDB();
  const product = data.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.quantity < quantity) return res.status(400).json({ error: 'Insufficient stock' });

  product.quantity -= Number(quantity);
  const sale = { id: Date.now().toString(), productId, quantity: Number(quantity), date: new Date().toISOString() };
  data.transactions.push(sale);

  await writeDB(data);
  res.json({ message: 'Sale recorded', sale });
});

app.patch('/sales/:id', async (req, res) => {
  try {
    const { quantity, productId } = req.body;
    const data = await readDB();
    const sale = data.transactions.find(s => s.id === req.params.id);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    // revert old sale from old product
    const oldProduct = data.products.find(p => p.id === sale.productId);
    if (oldProduct) oldProduct.quantity += sale.quantity;

    // update sale details
    sale.quantity = Number(quantity);
    sale.productId = productId ?? sale.productId;
    sale.date = new Date().toISOString();

    // apply sale to new product
    const newProduct = data.products.find(p => p.id === sale.productId);
    if (!newProduct) return res.status(404).json({ error: 'Product not found' });
    if (newProduct.quantity < sale.quantity) return res.status(400).json({ error: 'Insufficient stock' });
    newProduct.quantity -= sale.quantity;

    await writeDB(data);
    res.json({ message: 'Sale updated', sale });
  } catch (err) {
    console.error('patch sale error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/sales/:id', async (req, res) => {
  const data = await readDB();
  const sale = data.transactions.find(s => s.id === req.params.id);
  if (!sale) return res.status(404).json({ error: 'Sale not found' });

  const product = data.products.find(p => p.id === sale.productId);
  if (product) product.quantity += sale.quantity;

  data.transactions = data.transactions.filter(s => s.id !== req.params.id);
  await writeDB(data);
  res.json({ message: 'Sale deleted' });
});

// --- START SERVER ---
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT} (PORT=${PORT})`));
