import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/client";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
};

type ProductForm = Omit<Product, "id">;

const emptyForm: ProductForm = {
  name: "",
  price: 0,
  stock: 0,
  category: "",
};

function getProductsResponse(data: Product[] | { data: Product[] }) {
  return Array.isArray(data) ? data : data.data;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/products", { params: { limit: 100 } });
      setProducts(getProductsResponse(response.data));
    } catch (requestError) {
      console.error("Lỗi tải danh sách sản phẩm:", requestError);
      setError("Không thể tải danh sách sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: Number(product.price),
      stock: Number(product.stock),
      category: product.category,
    });
    setError("");
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !form.name.trim() ||
      !form.category.trim() ||
      form.price < 0 ||
      form.stock < 0
    ) {
      setError("Vui lòng nhập tên, danh mục và giá trị hợp lệ.");
      return;
    }

    setIsSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category.trim(),
    };

    try {
      if (editingId === null) {
        await api.post("/products", payload);
      } else {
        await api.patch(`/products/${editingId}`, payload);
      }
      setIsFormOpen(false);
      await fetchProducts();
    } catch (requestError) {
      console.error("Lỗi lưu sản phẩm:", requestError);
      setError("Không thể lưu sản phẩm. Hãy kiểm tra quyền quản trị.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return;

    setError("");
    try {
      await api.delete(`/products/${product.id}`);
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
    } catch (requestError) {
      console.error("Lỗi xóa sản phẩm:", requestError);
      setError("Không thể xóa sản phẩm. Hãy kiểm tra quyền quản trị.");
    }
  };

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-slate-950 text-white">
      <section className="w-full p-4 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm text-cyan-300">Quản trị hệ thống</p>
              <h1 className="text-3xl font-bold text-cyan-50">
                Quản lý sản phẩm
              </h1>
            </div>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus className="h-5 w-5" /> Thêm sản phẩm
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-cyan-500/20 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-sm text-cyan-100/60">Tổng sản phẩm</p>
            <p className="mt-2 text-3xl font-bold text-cyan-400">
              {products.length}
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-sm text-cyan-100/60">Tổng tồn kho</p>
            <p className="mt-2 text-3xl font-bold text-cyan-400">
              {products.reduce(
                (total, product) => total + Number(product.stock),
                0,
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-sm text-cyan-100/60">Giá trị danh mục</p>
            <p className="mt-2 text-xl font-bold text-cyan-400">
              {products
                .reduce(
                  (total, product) =>
                    total + Number(product.price) * Number(product.stock),
                  0,
                )
                .toLocaleString("vi-VN")}{" "}
              đ
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-cyan-500/20 bg-white/5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 p-5">
            <h2 className="text-xl font-bold text-cyan-50">
              Danh sách sản phẩm
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/60" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm sản phẩm..."
                className="w-64 rounded-xl border border-cyan-500/20 bg-slate-950/40 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-cyan-500/5 text-xs uppercase tracking-wider text-cyan-200/60">
                <tr>
                  <th className="px-5 py-4">Sản phẩm</th>
                  <th className="px-5 py-4">Danh mục</th>
                  <th className="px-5 py-4">Giá</th>
                  <th className="px-5 py-4">Tồn kho</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-cyan-100/60"
                    >
                      Đang tải sản phẩm...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-cyan-100/60"
                    >
                      Không có sản phẩm phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="transition hover:bg-cyan-500/5"
                    >
                      <td className="px-5 py-4 font-semibold text-cyan-50">
                        {product.name}
                      </td>
                      <td className="px-5 py-4 text-cyan-100/70">
                        {product.category}
                      </td>
                      <td className="px-5 py-4 font-semibold text-cyan-400">
                        {Number(product.price).toLocaleString("vi-VN")} đ
                      </td>
                      <td className="px-5 py-4 text-cyan-100/80">
                        {product.stock}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(product)}
                            className="rounded-lg border border-cyan-400/20 p-2 text-cyan-300 transition hover:bg-cyan-500/20"
                            aria-label={`Sửa ${product.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => void handleDelete(product)}
                            className="rounded-lg border border-rose-400/20 p-2 text-rose-400 transition hover:bg-rose-500/20"
                            aria-label={`Xóa ${product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <motion.form
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={(event) => void handleSubmit(event)}
            className="w-full max-w-lg rounded-3xl border border-cyan-500/30 bg-slate-900/95 p-6 shadow-2xl shadow-cyan-950/50"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-cyan-50">
                {editingId === null ? "Thêm sản phẩm" : "Cập nhật sản phẩm"}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-cyan-200/60 hover:text-white"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Tên sản phẩm"
                className="w-full rounded-xl border border-cyan-500/20 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-cyan-100/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              />
              <input
                required
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                placeholder="Danh mục"
                className="w-full rounded-xl border border-cyan-500/20 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-cyan-100/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  min="0"
                  type="number"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: Number(event.target.value) })
                  }
                  placeholder="Giá (VND)"
                  className="w-full rounded-xl border border-cyan-500/20 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-cyan-100/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                />
                <input
                  required
                  min="0"
                  type="number"
                  value={form.stock}
                  onChange={(event) =>
                    setForm({ ...form, stock: Number(event.target.value) })
                  }
                  placeholder="Tồn kho"
                  className="w-full rounded-xl border border-cyan-500/20 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-cyan-100/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>
            </div>
            <button
              disabled={isSaving}
              type="submit"
              className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {isSaving ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
}
