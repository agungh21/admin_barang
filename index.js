import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://default:zbr3K8DqUDAb2U2usqZD99wxGddV67WT@redis-14027.c277.us-east-1-3.ec2.redns.redis-cloud.com:14027");

redis.on("connect", () => {
    console.log("Connected to Redis Cloud ✅");
});

redis.on("error", (err) => {
    console.error("Redis connection error ❌", err);
});

const handler = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        // Ambil data dari Redis
        const data = await redis.get("barang");
        let barangList = data ? JSON.parse(data) : [];

        if (!Array.isArray(barangList)) {
            barangList = [barangList]; // Pastikan selalu dalam bentuk array
        }

        // ✅ GET: Ambil semua barang
        if (req.method === "GET") {
            return res.status(200).json(barangList);
        }

        // ✅ POST: Tambah barang baru
        if (req.method === "POST") {
            const { id, nama, harga } = req.body;
            if (!id || !nama || !harga) {
                return res.status(400).json({ message: "Semua field harus diisi!" });
            }

            const newBarang = { id, nama, harga };
            barangList.push(newBarang);

            await redis.set("barang", JSON.stringify(barangList));
            return res.status(201).json({ message: "Barang berhasil disimpan!", barang: newBarang });
        }

        // ✅ PUT: Update barang berdasarkan ID
        if (req.method === "PUT") {
            const { id, nama, harga } = req.body;
            if (!id || !nama || !harga) {
                return res.status(400).json({ message: "Semua field harus diisi!" });
            }

            const index = barangList.findIndex(item => item.id === id);
            if (index === -1) {
                return res.status(404).json({ message: "Barang tidak ditemukan!" });
            }

            barangList[index] = { id, nama, harga };
            await redis.set("barang", JSON.stringify(barangList));
            return res.status(200).json({ message: "Barang berhasil diperbarui!", barang: barangList[index] });
        }

        // ✅ DELETE: Hapus barang berdasarkan ID
        if (req.method === "DELETE") {
            let { id } = req.body;
        
            if (!id) {
                return res.status(400).json({ message: "ID harus disertakan untuk menghapus barang!" });
            }
        
            id = id.toString();
            const newBarangList = barangList.filter(item => item.id.toString() !== id);
        
            if (newBarangList.length === barangList.length) {
                return res.status(404).json({ message: "Barang tidak ditemukan!" });
            }
        
            await redis.set("barang", JSON.stringify(newBarangList));
            return res.status(200).json({ message: "Barang berhasil dihapus!" });
        }        

        return res.status(405).json({ message: "Method not allowed" });

    } catch (error) {
        console.error("Error handling request:", error);
        return res.status(500).json({ message: "Internal Server Error", error });
    }
};

export default handler;
