const express = require('express');
const cors = require('cors');
const { Redis } = require('@upstash/redis');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Koneksi ke Vercel KV (Upstash Redis)
const redis = new Redis({
    url: process.env.VERCEL_KV_REDIS_URL,
    token: process.env.VERCEL_KV_REDIS_TOKEN, // Jika ada token
});

app.use(cors());
app.use(express.json());

// ✅ Rute dasar untuk cek status
app.get('/', (req, res) => {
    res.send('Service berjalan dengan baik dengan Vercel KV!');
});

// ✅ **GET semua barang**
app.get('/barang', async (req, res) => {
    const items = await redis.get('barang') || []; // Ambil dari Redis
    res.json(items);
});

// ✅ **POST tambah barang baru**
app.post('/barang', async (req, res) => {
    const items = await redis.get('barang') || [];
    const newItem = { id: Date.now().toString(), ...req.body };

    items.push(newItem);
    await redis.set('barang', items); // Simpan ke Redis
    res.json(newItem);
});

// ✅ **PUT update barang berdasarkan ID**
app.put('/barang/:id', async (req, res) => {
    let items = await redis.get('barang') || [];
    const id = req.params.id;
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Barang tidak ditemukan!" });
    }

    items[index] = { ...items[index], ...req.body };
    await redis.set('barang', items); // Update Redis
    res.json(items[index]);
});

// ✅ **DELETE barang berdasarkan ID**
app.delete('/barang/:id', async (req, res) => {
    let items = await redis.get('barang') || [];
    const id = req.params.id;
    const newItems = items.filter(item => item.id !== id);

    if (newItems.length === items.length) {
        return res.status(404).json({ error: "Barang tidak ditemukan!" });
    }

    await redis.set('barang', newItems); // Simpan perubahan
    res.json({ message: 'Item deleted' });
});

// ✅ **Menjalankan server**
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
