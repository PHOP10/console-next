import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // เลือก URL: ถ้ามี ENV ให้ใช้ ถ้าไม่มีให้ใช้ localhost (สำหรับเทส)
    // แนะนำ: ให้ไปตั้งค่าใน .env ว่า INTERNAL_API_URL="http://my-backend:4000/api"
    const backendUrl =
      process.env.INTERNAL_API_URL || "http://localhost:4000/api";

    console.log("Gateway forwarding to:", `${backendUrl}/auth/login`);

    // ยิงไปหา Backend (NestJS) โดยตรง
    const response = await axios.post(`${backendUrl}/auth/login`, {
      username,
      password,
    });

    // ถ้า Backend ตอบ 200/201 (สำเร็จ) -> ส่งต่อให้หน้าบ้าน
    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    // ถ้า Backend ตอบ Error (404/401)
    console.error("Gateway Error:", error.response?.data || error.message);

    const status = error.response?.status || 500;
    const message = error.response?.data?.message || "เชื่อมต่อ Server ไม่ได้";

    // แปลงข้อความให้เป็น String เสมอ (เผื่อ NestJS ส่งมาเป็น Array)
    const finalMessage = Array.isArray(message) ? message[0] : message;

    return NextResponse.json(
      { success: false, message: finalMessage },
      { status: status },
    );
  }
}
