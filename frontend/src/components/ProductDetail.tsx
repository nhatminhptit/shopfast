import { useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api/client";
import { addItem, type Product } from "../store/cartSlice";
import type { AppDispatch } from "../store/store";

type ProductDetails = Product & {
  stock: number;
  category: string;
};

function getProductResponse(data: ProductDetails | { data: ProductDetails }) {
  return "data" in data ? data.data : data;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Không tìm thấy mã sản phẩm.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/products/${id}`);
        setProduct(getProductResponse(response.data));
      } catch (requestError) {
        console.error("Lỗi lấy chi tiết sản phẩm:", requestError);
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    void fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    for (let index = 0; index < quantity; index += 1) {
      dispatch({
        type: addItem.type,
        payload: {
          id: String(product.id),
          name: product.name,
          price: Number(product.price),
          image: product.image,
        },
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-900 p-8">
        <div className="mx-auto h-96 max-w-7xl animate-pulse rounded-3xl border border-cyan-500/20 bg-white/5" />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-900 p-8 text-center">
        <div className="rounded-3xl border border-rose-400/20 bg-white/5 p-10">
          <p className="mb-6 text-rose-300">
            {error || "Sản phẩm không tồn tại."}
          </p>
          <Link
            to="/"
            className="rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-5 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-500"
          >
            Về trang chủ
          </Link>
        </div>
      </main>
    );
  }

  const stock = Number(product.stock);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-900 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-cyan-200 transition hover:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>

        <div className="grid gap-8 rounded-3xl border border-cyan-500/20 bg-white/5 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl md:grid-cols-2 md:p-8">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-cyan-950 to-blue-900">
            <ShoppingBag className="h-32 w-32 text-cyan-300/40" />
          </div>

          <div className="flex flex-col justify-center">
            <span className="mb-3 w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-cyan-50 md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 text-3xl font-bold text-cyan-400">
              {Number(product.price).toLocaleString("vi-VN")} đ
            </p>
            <p className="mt-4 text-cyan-100/70">
              Sản phẩm công nghệ chính hãng, thiết kế hiện đại và sẵn sàng cho
              nhu cầu làm việc, học tập hoặc giải trí của bạn.
            </p>
            <p className="mt-5 text-sm text-cyan-200">
              {stock > 0 ? `Còn ${stock} sản phẩm` : "Tạm hết hàng"}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-xl border border-cyan-500/30 bg-slate-950/40">
                <button
                  aria-label="Giảm số lượng"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="p-3 text-cyan-300 disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center">{quantity}</span>
                <button
                  aria-label="Tăng số lượng"
                  disabled={quantity >= stock}
                  onClick={() =>
                    setQuantity((value) => Math.min(stock, value + 1))
                  }
                  className="p-3 text-cyan-300 disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={stock <= 0}
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShoppingBag className="h-5 w-5" /> Thêm vào giỏ
              </motion.button>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-cyan-100/60">
              <Zap className="h-4 w-4 text-cyan-400" /> Giao hàng nhanh toàn
              quốc
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
