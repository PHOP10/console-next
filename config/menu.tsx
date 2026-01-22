import {
  ContainerOutlined,
  LogoutOutlined,
  UserOutlined,
  FileOutlined,
  FileTextOutlined,
  CarOutlined,
  FrownOutlined,
  FileZipOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  HddOutlined,
  TruckOutlined,
  TeamOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { MenuProps } from "antd";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";
import { indexService } from "../services/index.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";

// Interface สำหรับเมนู
export interface IMenuChild {
  key: string;
  icon?: React.ReactElement;
  label: string;
  roles?: string[];
}

export interface IMenu {
  key: string;
  icon?: React.ReactElement;
  label: string;
  roles?: string[];
  children?: IMenuChild[];
}

// กำหนด role
export const group = {
  admin: "admin",
  user: "user",
  asset: "asset",
  pharmacy: "pharmacy",
  home: "home",
};

// เมนูหลัก
export const MenuSider: IMenu[] = [
  /*   {
    key: "dashboard",
    icon: <FileTextOutlined />,
    label: "โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านผาผึ้ง",
    roles: [group.admin],
  }, */
  {
    key: "official-travel-request",
    label: "ระบบขอไปราชการ",
    // roles: [group.admin, group.user, group.pharmacy, group.asset, group.home],
    icon: <FileZipOutlined />,
    children: [
      {
        key: "officialTravelRequest",
        label: "ข้อมูลขอไปราชการ",
        roles: [
          group.admin,
          group.user,
          group.pharmacy,
          group.asset,
          group.home,
        ],
      },
      {
        key: "officialTravelRequestBook",
        label: "ขอไปราชการ",
        roles: [
          group.admin,
          group.user,
          group.pharmacy,
          group.asset,
          group.home,
        ],
      },
      {
        key: "manageOfficialTravelRequest",
        label: "จัดการการขอไปราชการ",
        roles: [group.admin],
      },
    ],
  },
  {
    key: "ma-car",
    label: `ระบบจองรถ`,
    // roles: [group.admin, group.user, group.pharmacy, group.asset],
    icon: <CarOutlined />,
    children: [
      {
        key: `maCar`,
        label: `ข้อมูลการจองรถ`,
        roles: [
          group.admin,
          group.user,
          group.pharmacy,
          group.asset,
          group.home,
        ],
      },
      {
        key: `maCarBook`,
        label: `จองรถ`,
        roles: [
          group.admin,
          group.user,
          group.pharmacy,
          group.asset,
          group.home,
        ],
      },
      {
        key: `manageMaCar`,
        label: `จัดการการจองรถ`,
        roles: [group.admin],
      },
    ],
  },
  {
    key: "data-leave",
    label: `ระบบการลา`,
    // roles: [group.admin, group.user, group.pharmacy, group.asset],
    icon: <FrownOutlined />,
    children: [
      {
        key: `dataLeave`,
        label: `ข้อมูลการลา`,
        roles: [
          group.admin,
          group.user,
          group.pharmacy,
          group.asset,
          group.home,
        ],
      },
      {
        key: `dataLeaveBook`,
        label: `ยื่นใบลา`,
        roles: [
          group.admin,
          group.user,
          group.pharmacy,
          group.asset,
          group.home,
        ],
      },
      {
        key: `manageDataLeave`,
        roles: [group.admin],
        label: `จัดการการลา`,
      },
    ],
  },
  {
    key: "visit-home",
    label: `ระบบเยี่ยมบ้าน`,
    // roles: [group.admin, group.user, group.pharmacy, group.asset],
    icon: <HomeOutlined />,
    children: [
      {
        key: "visitHome",
        label: "การเยี่ยบ้าน",
        roles: [group.admin, group.home],
      },
      {
        key: "dataVisitHome",
        label: "ข้อมูลการเยี่ยบ้าน",
        roles: [
          group.admin,
          group.user,
          group.pharmacy,
          group.asset,
          group.home,
        ],
      },
    ],
  },
  {
    key: "ma-drug",
    label: `ระบบยา`,
    roles: [group.admin, group.pharmacy],
    icon: <MedicineBoxOutlined />,
    children: [
      {
        key: "maDrug",
        label: "เบิกจ่ายยา",
        roles: [group.admin, group.pharmacy],
      },
      {
        key: "drug",
        label: "ข้อมูลยา",
        roles: [group.admin, group.pharmacy],
      },
      {
        key: "manageDrug",
        label: "จัดการเบิกจ่ายยา",
        roles: [group.admin, group.pharmacy],
      },
    ],
  },
  {
    key: "durable-article",
    label: `ระบบครุภัณฑ์`,
    // roles: [group.admin, group.asset],
    icon: <HddOutlined />,
    children: [
      {
        key: "durableArticle",
        label: "ข้อมูลครุภัณฑ์",
        roles: [
          group.admin,
          group.user,
          group.pharmacy,
          group.asset,
          group.home,
        ],
      },
      {
        key: "supportingResource",
        label: "วัสดุสนับสนุน",
        roles: [
          group.admin,
          group.user,
          group.pharmacy,
          group.asset,
          group.home,
        ],
      },
    ],
  },
  {
    key: "medical-equipment",
    label: `เครื่องมือแพทย์`,
    // roles: [group.admin, group.user, group.pharmacy, group.asset],
    icon: <TruckOutlined />,
    children: [
      {
        key: "medicalEquipment",
        label: "ข้อมูลเครื่องมือแพทย์",
        roles: [
          group.admin,
          group.user,
          group.pharmacy,
          group.asset,
          group.home,
        ],
      },
      {
        key: "maMedicalEquipment",
        label: "จัดการข้อมมูลเครื่องมือแพทย์",
        roles: [group.admin],
      },
    ],
  },
  {
    key: "infectious-waste",
    label: `ทิ้งขยะ`,
    // roles: [group.admin, group.user, group.pharmacy, group.asset],
    icon: <DeleteOutlined />,
  },
  {
    key: "user",
    label: `ผู้ใช้`,
    roles: [group.admin, group.user, group.pharmacy, group.asset, group.home],
    icon: <TeamOutlined />,
  },
];

// ฟังก์ชันกรองเมนูตาม role จาก session
export const menuSider = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role ?? "user";
  const filterByRole = (menu: IMenu): boolean => {
    if (!menu.roles) return true;
    return menu.roles.includes(userRole);
  };

  const mapMenu = MenuSider.filter(filterByRole).map((item: IMenu) => {
    if (!item.children) {
      return {
        ...item,
        label: <Link href={`/page/${item.key}`}>{item.label}</Link>,
      };
    }
    return {
      ...item,
      children: item.children
        ?.filter((child) => child.roles?.includes(userRole))
        .map((child: IMenuChild) => ({
          ...child,
          label: (
            <Link href={`/page/${item.key}/${child.key}`}>{child.label}</Link>
          ),
        })),
    };
  });

  return mapMenu;
};
// ฟังก์ชันช่วยแปลง pathname เป็น breadcrumb
function replaceSpecialCharactersWithSpace(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, " ");
}

export const itemBreadcrumbMenu = (pathname: string) => {
  const currentPath = pathname.split("/")[2] ?? pathname.split("/")[1];
  return MenuSider?.filter((menu: any) => menu.key === currentPath).map(
    (item: any) => {
      if (item.children && item.children.length > 1) {
        const childPath = pathname.split("/")[3];
        const childMenu = item?.children.find(
          (x: any) =>
            x.label.toLowerCase() ===
            replaceSpecialCharactersWithSpace(childPath.toLowerCase()),
        );
        return [
          { title: <Link href={"/page"}></Link> },
          { title: item.label },
          { title: childMenu?.label },
        ];
      }
      return [{ title: <Link href={"/page"}></Link> }, { title: item.label }];
    },
  )[0];
};

// เมนู user dropdown
const MenuNav: MenuProps["items"] = [
  {
    key: "1",
    label: (
      <Link href={`/page/user`}>โปรไฟล์</Link>
    ) /* app/page/user/components/ProfileDetails.tsx */,
    icon: <UserOutlined />,
  },
  {
    key: "2",
    label: (
      <Link href={"#"} onClick={() => signOut()}>
        ออกจากระบบ
      </Link>
    ),
    icon: <LogoutOutlined />,
  },
];

export default MenuNav;
function useState<T>(arg0: {}): [any, any] {
  throw new Error("Function not implemented.");
}

function useEffect(arg0: () => void, arg1: never[]) {
  throw new Error("Function not implemented.");
}
