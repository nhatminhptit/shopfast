import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Xin chào! Tôi có thể giúp bạn tìm sản phẩm, tư vấn cấu hình hoặc giải đáp thắc mắc về ShopFast.",
  },
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const nextMessageId = useRef(initialMessages.length + 1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = input.trim();

    if (!content || isTyping) {
      return;
    }

    const userMessage: Message = {
      id: nextMessageId.current++,
      role: "user",
      content,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    let response =
      "Tôi chưa có thông tin phù hợp cho câu hỏi này. Bạn có thể hỏi về giao hàng, thanh toán hoặc sản phẩm.";
    if (/giao\s*hàng|bao\s*lâu/i.test(content)) {
      response =
        "ShopFast giao hàng hỏa tốc trong 2h tại nội thành và 2-3 ngày đối với các tỉnh khác.";
    } else if (/thanh\s*toán/i.test(content)) {
      response =
        "Hệ thống hỗ trợ thanh toán bằng mã QR chuyển khoản và trả tiền mặt khi nhận hàng (COD).";
    } else if (/sản\s*phẩm/i.test(content)) {
      response =
        "Chúng tôi có các sản phẩm công nghệ như Laptop, Màn hình, Chuột và Bàn phím cơ. Bạn cần tìm loại nào?";
    }

    /*
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: content }),
    });
    const data: { reply: string } = await response.json();
    */

    const assistantMessage: Message = {
      id: nextMessageId.current++,
      role: "assistant",
      content: response,
    };
    setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    setIsTyping(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-[60] flex h-[min(620px,calc(100vh-7rem))] w-[min(380px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/80 shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-xl"
            aria-label="Trợ lý AI ShopFast"
          >
            <header className="flex items-center justify-between border-b border-cyan-500/20 bg-cyan-500/10 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-400/20 p-2 text-cyan-300">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-cyan-50">Trợ lý ảo AI</h2>
                  <p className="flex items-center gap-1 text-xs text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Đang trực tuyến
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-cyan-100/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Đóng khung chat"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "rounded-br-md border border-cyan-400/20 bg-cyan-500/20 text-cyan-50"
                        : "rounded-bl-md border border-cyan-500/10 bg-white/5 text-cyan-50"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-cyan-500/10 bg-white/5 px-4 py-3">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 0.9,
                          repeat: Infinity,
                          delay: dot * 0.15,
                        }}
                        className="h-1.5 w-1.5 rounded-full bg-cyan-300"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="border-t border-cyan-500/20 bg-slate-950/20 p-3"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-white/5 p-1.5 focus-within:border-cyan-400/60">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Nhập câu hỏi của bạn..."
                  aria-label="Tin nhắn cho ShopFast AI"
                  className="min-w-0 flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none outline-cyan-400 placeholder:text-cyan-100/40 focus:outline-2"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="rounded-xl bg-cyan-500 p-2.5 text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Gửi tin nhắn"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/60 bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-[0_0_18px_rgba(6,182,212,0.55)] transition-shadow hover:shadow-[0_0_28px_rgba(6,182,212,0.8)]"
        aria-label={isOpen ? "Đóng ShopFast AI" : "Mở ShopFast AI"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            <Sparkles className="absolute right-2 top-1 h-3.5 w-3.5 text-cyan-100" />
          </>
        )}
      </motion.button>
    </>
  );
}
