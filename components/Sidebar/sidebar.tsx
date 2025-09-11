"use client";

import React, { useEffect, useState } from "react";
import { Menu, Badge } from "antd";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { MenuSider, IMenu, IMenuChild } from "../../config/menu";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { indexService } from "../../services/index.service";

const Sidebar: React.FC<{ collapsed?: boolean }> = ({ collapsed }) => {
  const { data: session } = useSession();
  const userRole = session?.user?.role ?? "user";
  const pathname = usePathname(); // ✅ ดักเปลี่ยนหน้า

  const intraAuth = useAxiosAuth();
  const intraAuthService = indexService(intraAuth);

  const [counts, setCounts] = useState<{ [key: string]: number }>({});

  // ฟังก์ชันดึง notification
  const fetchNotificationCounts = async () => {
    try {
      const res = await intraAuthService.getNotifications();
      setCounts(res); // res ต้องเป็น object { menuKey: number }
      console.log("Notification counts:", res);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotificationCounts();
  }, []); // เรียกตอน mount

  // ✅ รีเฟรชทุกครั้งที่ pathname เปลี่ยน
  useEffect(() => {
    fetchNotificationCounts();
  }, [pathname]);

  const filterByRole = (menu: IMenu) =>
    !menu.roles || menu.roles.includes(userRole);

  const mapMenu = MenuSider.filter(filterByRole).map((item: IMenu) => {
    if (!item.children) {
      const count = counts[item.key] || 0;
      return {
        ...item,
        label: (
          <Link href={`/page/${item.key}`}>
            {item.label} {count > 0 && <Badge count={count} />}
          </Link>
        ),
      };
    }
    return {
      ...item,
      children: item.children
        ?.filter((child: any) => !child.roles || child.roles.includes(userRole))
        .map((child: IMenuChild) => {
          const count = counts[child.key] || 0;
          return {
            ...child,
            label: (
              <Link href={`/page/${item.key}/${child.key}`}>
                {child.label} {count > 0 && <Badge count={count} />}
              </Link>
            ),
          };
        }),
    };
  });

  return <Menu items={mapMenu} mode="inline" />;
};

export default Sidebar;
