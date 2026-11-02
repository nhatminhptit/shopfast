import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  removeItem,
  selectCartItems,
  selectCartTotal,
  updateQuantity,
} from "../store/cartSlice";
import type { AppDispatch, RootState } from "../store/store";
import { useState } from "react";

export default function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => selectCartItems(state));
  const total = useSelector((state: RootState) => selectCartTotal(state));
  const [showQR, setShowQR] = useState(false);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-900 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-cyan-50">Giỏ hàng của bạn</h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-cyan-500/20 bg-white/5 py-20 text-center">
            <ShoppingBag className="mx-auto mb-4 h-14 w-14 text-cyan-400/50" />
            <p className="mb-6 text-cyan-100/60">Giỏ hàng đang trống.</p>
            <Link
              to="/"
              className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-cyan-500/20 bg-white/5 p-4 backdrop-blur-xl"
                >
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-cyan-950">
                    <ShoppingBag className="h-8 w-8 text-cyan-300/50" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${item.id}`}
                      className="font-semibold text-cyan-50 hover:text-cyan-400"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-cyan-400">
                      {Number(item.price).toLocaleString("vi-VN")} đ
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-cyan-500/30 bg-slate-950/40">
                        <button
                          aria-label={`Giảm số lượng ${item.name}`}
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                id: item.id,
                                quantity: item.quantity - 1,
                              }),
                            )
                          }
                          className="p-2 text-cyan-300"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          aria-label={`Tăng số lượng ${item.name}`}
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                id: item.id,
                                quantity: item.quantity + 1,
                              }),
                            )
                          }
                          className="p-2 text-cyan-300"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        aria-label={`Xóa ${item.name}`}
                        onClick={() => dispatch(removeItem(item.id))}
                        className="text-rose-400 transition hover:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-cyan-500/20 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-cyan-50">
                Tóm tắt đơn hàng
              </h2>
              <div className="my-5 flex justify-between border-b border-cyan-500/20 pb-5 text-cyan-100/70">
                <span>Tạm tính</span>
                <span>{total.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="mb-6 flex justify-between text-xl font-bold">
                <span>Tổng cộng</span>
                <span className="text-cyan-400">
                  {total.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <button
                className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
                onClick={() => setShowQR(true)}
              >
                Tiến hành thanh toán
              </button>
            </aside>
          </div>
        )}
      </div>

      {/* Modal QR Code Thanh Toán */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800/90 border border-cyan-500/30 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-2xl font-bold text-cyan-400 mb-2">
              Quét mã thanh toán
            </h3>
            <p className="text-cyan-100/70 text-sm mb-6">
              Sử dụng App Ngân hàng hoặc Momo
            </p>

            {/* Tích hợp API VietQR tạo mã động theo đúng số tiền giỏ hàng */}
            <div className="bg-white p-2 rounded-2xl mb-6">
              <img
                src={`https://img.vietqr.io/image/970436-0123456789-compact2.jpg?amount=${total}&addInfo=ThanhToanShopFast&accountName=SHOPFAST`}
                alt="QR Thanh Toán"
                className="w-full rounded-xl"
              />
            </div>

            <p className="text-cyan-50 font-semibold mb-6">
              Tổng tiền:{" "}
              <span className="text-cyan-400 text-xl">
                {total.toLocaleString("vi-VN")} đ
              </span>
            </p>

            <button
              onClick={() => setShowQR(false)}
              className="w-full py-3 bg-white/5 hover:bg-rose-500/20 text-cyan-100 hover:text-rose-400 border border-cyan-500/20 hover:border-rose-500/30 rounded-xl transition-all font-medium"
            >
              Hủy giao dịch
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
