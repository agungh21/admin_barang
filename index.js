const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL);

const handler = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method === "GET") {
        const data = await redis.get("barang");
        const barang = data ? JSON.parse(data) : [];
        return res.status(200).json(barang);
    } 
    
    if (req.method === "POST") {
        const { id, nama, harga } = req.body;
        const barang = { id, nama, harga };

        await redis.set("barang", JSON.stringify(barang), "EX", 3600);
        return res.status(201).json({ message: "Barang berhasil disimpan!", barang });
    } 

    return res.status(405).json({ message: "Method not allowed" });
};

module.exports = handler; // ⬅️ Gunakan `module.exports` untuk CommonJS
