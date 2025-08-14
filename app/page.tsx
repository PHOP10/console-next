"use client";

import { Spin } from "antd";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
export default function Main() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });

  if (session) {
    redirect("/page");
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Spin />
    </div>
  );
}
