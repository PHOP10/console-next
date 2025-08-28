"use client";
import "./globals.css";
import AuthProvider from "@/provider/AuthProvider";
import { ConfigProvider } from "antd";
import {
  Prompt,
  Noto_Sans_Thai,
  Sarabun,
  Kanit,
  Roboto,
} from "next/font/google";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: "300",
});

// const kanit = Kanit({
//   subsets: ["latin", "thai"],
//   weight: "300",
// });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <ConfigProvider
        theme={
          {
            // token: {
            //   fontFamily: kanit.style.fontFamily,
            // },
          }
        }
      >
        <body style={{ margin: 0 }}>
          <AuthProvider>{children}</AuthProvider>
        </body>
      </ConfigProvider>
    </html>
  );
}
