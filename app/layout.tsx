"use client";
import "./globals.css";
import AuthProvider from "@/provider/AuthProvider";
import { ConfigProvider } from "antd";
import { Prompt } from "next/font/google";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: prompt.style.fontFamily,
            borderRadius: 16, // เพิ่มความโค้งอีกนิดให้ดูละมุน
            colorPrimary: "#4096ff",
            colorText: "#1e293b",

            // ลบสีพื้นหลัง Default
            colorBgLayout: "transparent",
            colorBgContainer: "#ffffff",
          },
          components: {
            Layout: {
              bodyBg: "transparent",
              headerBg: "transparent",
            },
            Table: {
              headerBg: "rgba(255, 255, 255, 0.5)", // หัวตารางใสๆ แบบกระจก
              headerBorderRadius: 12,
              rowHoverBg: "rgba(64, 150, 255, 0.05)", // สีจางๆ ตอนชี้แถว
              borderColor: "rgba(0,0,0,0.03)", // เส้นตารางบางเฉียบ
            },
            Card: {
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              actionsLiMargin: "0",
              colorBgContainer: "rgba(255, 255, 255, 0.6)", // ปรับความโปร่งแสงตรงนี้แทน (0.6 - 0.8)
            },
            Menu: {
              itemBorderRadius: 10,
              itemSelectedBg:
                "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              itemSelectedColor: "#ffffff",
              itemHoverBg: "rgba(59, 130, 246, 0.08)",
              iconSize: 18,
            },
          },
        }}
      >
        <body
          className={prompt.className}
          style={{
            margin: 0,
            padding: 0,
            minHeight: "100vh",

            background: `
              radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
              radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
              radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%),
              #ffffff
            `,
            backgroundColor: "#ffffff",
            backgroundImage: `
    radial-gradient(at 40% 20%, hsla(152, 100%, 90%, 1) 0px, transparent 50%),  /* เขียวมิ้นท์ */
    radial-gradient(at 80% 0%, hsla(189, 100%, 90%, 1) 0px, transparent 50%),   /* ฟ้าอ่อน */
    radial-gradient(at 0% 50%, hsla(120, 100%, 93%, 1) 0px, transparent 50%),   /* เขียวอ่อน */
    radial-gradient(at 80% 50%, hsla(210, 100%, 92%, 1) 0px, transparent 50%),  /* ฟ้าครามจางๆ */
    radial-gradient(at 0% 100%, hsla(170, 100%, 88%, 1) 0px, transparent 50%),  /* เขียวน้ำทะเล */
    radial-gradient(at 80% 100%, hsla(200, 100%, 92%, 1) 0px, transparent 50%), /* ฟ้าสดใส */
    radial-gradient(at 0% 0%, hsla(190, 100%, 95%, 1) 0px, transparent 50%)     /* ฟ้าขาว */
`,
            // ===============================================
            backgroundAttachment: "fixed",
            backgroundSize: "100% 100%",
          }}
        >
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <AuthProvider>{children}</AuthProvider>
          </div>
        </body>
      </ConfigProvider>
    </html>
  );
}
