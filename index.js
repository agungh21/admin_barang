const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = 'data.json';

app.use(cors());
app.use(express.json());

// Load data
const loadData = () => {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE));
    }
    return [];
};

// Save data
const saveData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// ✅ **GET semua barang**
app.get('/barang', (req, res) => {
    res.json(loadData());
});

// ✅ **POST tambah barang baru**
app.post('/barang', (req, res) => {
    const items = loadData();
    const newItem = { id: Date.now().toString(), ...req.body }; // ID tetap string
    items.push(newItem);
    saveData(items);
    res.json(newItem);
});

// ✅ **PUT update barang berdasarkan ID**
app.put('/barang/:id', (req, res) => {
    let items = loadData();
    const id = req.params.id; // ID sebagai string
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Barang tidak ditemukan!" });
    }

    items[index] = { ...items[index], ...req.body }; // Update data
    saveData(items);
    res.json(items[index]);
});

// ✅ **DELETE barang berdasarkan ID**
app.delete('/barang/:id', (req, res) => {
    let items = loadData();
    const id = req.params.id; // ID sebagai string
    const newItems = items.filter(item => item.id !== id);

    if (newItems.length === items.length) {
        return res.status(404).json({ error: "Barang tidak ditemukan!" });
    }

    saveData(newItems);
    res.json({ message: 'Item deleted' });
});

// ✅ **Menjalankan server**
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
