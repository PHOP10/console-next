// app/hooks/useNotificationSocket.ts
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

// URL ของ Backend (ควรดึงจาก Env หรือใส่ตรงๆ ไปก่อนเพื่อเทส)
const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_BASE?.replace("/api", "") ||
  "http://localhost:4000";

export const useNotificationSocket = (
  userId: string | undefined,
  setCounts: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // 1. เชื่อมต่อ Socket (ระบุ Namespace 'notifications' ตามที่ตั้งใน Backend)
    // URL จะเป็น: http://localhost:4000/notifications
    socketRef.current = io(`${SOCKET_URL}/notifications`, {
      query: { userId }, // ส่ง userId ไปเพื่อ Join Room
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    // 2. ฟัง Event "notification" จาก Backend
    socket.on("notification", (payload: any) => {
      // กรณีที่ 1: ได้รับตัวเลขใหม่ล่าสุด (Backend ส่ง counts_update มาให้)
      if (payload.type === "counts_update" && payload.counts) {
        // อัปเดต State ทันที! Badge จะเปลี่ยนเลขปุ๊บ
        setCounts(payload.counts.menuCounts || {});
      }

      // กรณีที่ 2: มีการแจ้งเตือนใหม่ (new_notification)
      // คุณอาจจะเพิ่ม Toast หรือเสียงแจ้งเตือนตรงนี้ได้
      if (payload.type === "new_notification") {
        // ตัวอย่าง: playSound();
      }
    });

    // 3. Cleanup เมื่อปิดหน้าเว็บ
    return () => {
      socket.disconnect();
    };
  }, [userId, setCounts]);
};
