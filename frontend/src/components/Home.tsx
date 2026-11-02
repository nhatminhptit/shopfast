import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Star, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api/client";
import { addItem } from "../store/cartSlice";
import type { AppDispatch } from "../store/store";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      // Đảm bảo dữ liệu nhận được luôn được chuyển đổi thành mảng
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        // Trường hợp backend bọc dữ liệu trong một object có thuộc tính 'data'
        setProducts(res.data.data);
      } else {
        // Nếu không phải mảng, set về mảng rỗng để không bị lỗi map
        setProducts([]);
        console.warn("Dữ liệu API trả về không phải là mảng:", res.data);
      }
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
      setProducts([]); // Đảm bảo lỗi cũng không sập trang
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Hàm tự động nạp dữ liệu mẫu
  const handleSeedData = async () => {
    setIsSeeding(true);
    const mockProducts = [
      {
        name: "MacBook Pro 14 M3 Pro",
        price: 49990000,
        stock: 12,
        category: "Laptop",
      },
      {
        name: "Dell UltraSharp U2723QE 27-inch 4K",
        price: 15490000,
        stock: 8,
        category: "Màn hình",
      },
      {
        name: "NuPhy Halo75 V2 Bàn phím cơ không dây",
        price: 3250000,
        stock: 20,
        category: "Bàn phím",
      },
      {
        name: "Chuột Logitech MX Master 3S",
        price: 2590000,
        stock: 35,
        category: "Chuột",
      },
      {
        name: "Sony WH-1000XM5 Chống ồn chủ động",
        price: 7490000,
        stock: 15,
        category: "Tai nghe",
      },
      {
        name: "Keychron Q1 Pro QMK/VIA",
        price: 4290000,
        stock: 18,
        category: "Bàn phím",
      },
      {
        name: "Samsung T7 Shield SSD 1TB",
        price: 2490000,
        stock: 25,
        category: "Phụ kiện",
      },
      {
        name: "Logitech Brio 4K Webcam",
        price: 4290000,
        stock: 10,
        category: "Webcam",
      },
    ];

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    try {
      for (const item of mockProducts) {
        await api.post("/products", item);
        await delay(1000); // Delay 1 giây giữa các lần gọi API để tránh quá tải server
      }
      await fetchProducts(); // Gọi lại API để load lưới sản phẩm mới
    } catch (error) {
      alert(
        "Lỗi khi thêm dữ liệu (có thể do API phân quyền Admin hoặc sai tên trường). Hãy dùng Prisma Studio để thêm tay nhé!",
      );
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3 text-cyan-400">
            <Star className="w-8 h-8 fill-cyan-400" /> Sản phẩm nổi bật
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-80 bg-white/5 rounded-2xl animate-pulse border border-cyan-500/10"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white/5 border border-cyan-500/20 rounded-2xl p-4 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 flex flex-col justify-between"
              >
                <div>
                  <Link
                    to={`/products/${product.id}`}
                    className="block aspect-square rounded-xl bg-slate-800 mb-4 overflow-hidden relative"
                  >
                    <div className="w-full h-full bg-gradient-to-tr from-slate-700 to-cyan-900 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                  </Link>
                  <Link
                    to={`/products/${product.id}`}
                    className="font-semibold text-lg text-cyan-50 line-clamp-2 hover:text-cyan-400"
                  >
                    {product.name}
                  </Link>
                  <p className="text-cyan-400 font-bold mt-2 text-xl">
                    {Number(product.price).toLocaleString("vi-VN")} đ
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-4 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white border border-cyan-500/50 py-2 rounded-xl flex items-center justify-center gap-2 transition-all font-medium"
                  onClick={() =>
                    dispatch(
                      addItem({
                        id: String(product.id),
                        name: product.name,
                        price: Number(product.price),
                      }),
                    )
                  }
                >
                  <ShoppingBag className="w-4 h-4" /> Thêm vào giỏ
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/5 border border-cyan-500/20 rounded-3xl"
          >
            <p className="text-cyan-100/50 mb-6">
              Chưa có sản phẩm nào trong cơ sở dữ liệu.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSeedData}
              disabled={isSeeding}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 mx-auto transition-colors disabled:opacity-50"
            >
              <PlusCircle className="w-5 h-5" />
              {isSeeding ? "Đang tạo dữ liệu..." : "Tạo nhanh sản phẩm mẫu"}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
