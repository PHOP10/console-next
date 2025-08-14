import {
  ContainerOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { MenuProps } from "antd";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";

const MenuNav: MenuProps["items"] = [
  {
    key: "1",
    label: <Link href={`/page/profile`}>Profile</Link>,
    icon: <UserOutlined />,
  },
  {
    key: "2",
    label: (
      <Link href={"#"} onClick={() => signOut()}>
        Logout
      </Link>
    ),
    icon: <LogoutOutlined />,
  },
];

export default MenuNav;

export interface IMenuChild {
  key: string;
  icon: React.ReactElement;
  label: string;
  roles: string[];
}

export interface IMenu {
  key: string;
  icon: React.ReactElement;
  label: string;
  roles: string[];
  children?: IMenuChild[];
}

export const groupRolesConfig = {
  admin: "admin",
};

export const MenuSider = [
  {
    key: `dashboard`,
    icon: <ContainerOutlined />,
    label: `Dashbaord`,
    roles: [groupRolesConfig.admin],
  },
  {
    key: "official-travel-request",
    label: `ระบบขอไปราชการ`,
    children: [
      {
        key: `officialTravelRequest`,
        label: `ข้อมูลขอไปราชการ`,
      },
      {
        key: `officialTravelRequestBooking`,
        label: `ขอไปราชการ`,
      },
      {
        key: `managementOfficialTravelRequest`,
        label: `จัดการการขอไปราชการ`,
      },
    ],
  },
  {
    key: "macar",
    label: `ระบบจองรถ`,
    // rule: "mac-s",
    children: [
      {
        key: `maCar`,
        label: `ข้อมูลการจองรถ`,
        // rule: "mac-c-s",
      },
      {
        key: `maCarBooking`,
        label: `จองรถ`,
        // rule: "mac-b-s",
      },
      {
        key: `managementCar`,
        label: `จัดการการจองรถ`,
        // rule: "mac-m-s",
      },
    ],
  },
  {
    key: "data-leave",
    label: `ระบบการลา`,
    children: [
      {
        key: `dataLeave`,
        label: `ข้อมูลการลา`,
      },
      {
        key: `leaveBooking`,
        label: `ยื่นใบลา`,
      },
      {
        key: `managementDataLeave`,
        label: `จัดการการลา`,
      },
    ],
  },
  {
    key: "visit-home",
    label: `ระบบเยี่ยมบ้าน`,
    children: [
      {
        key: "visitHome",
        label: "การเยี่ยบ้าน",
      },
      {
        key: "dataVisitHome",
        label: "ข้อมูลการเยี่ยบ้าน",
      },
    ],
  },
  {
    key: "ma-drug",
    label: `ระบบยา`,
    children: [
      {
        key: "maDrug",
        label: "เบิกจ่ายยา",
      },
      {
        key: "drug",
        label: "ข้อมูลยา",
      },
      {
        key: "manageDrug",
        label: "จัดการเบิกจ่ายยา",
      },
    ],
  },
  {
    key: "durable-article",
    label: `ระบบครุภัณฑ์`,
    children: [
      {
        key: "durableArticle",
        label: "ข้อมูลครุภัณฑ์`",
      },
      {
        key: "supportingResource",
        label: "วัสดุสนับสนุน",
      },
    ],
  },
  {
    key: "medical-equipment",
    label: `เครื่องมือแพทย์`,
    children: [
      {
        key: "medicalEquipment",
        label: "ข้อมมูลเครื่องมือแพทย์",
      },
      {
        key: "maMedicalEquipment",
        label: "จัดการข้อมมูลเครื่องมือแพทย์",
      },
    ],
  },
  {
    key: "infectious-waste",
    label: `ทิ้งขยะ`,
    children: [
      {
        key: "infectiousWaste",
        label: "ข้อมมูลขะยะติดเชื้อ",
      },
    ],
  },
  // {
  //   key: `products`,
  //   icon: <DashboardOutlined />,
  //   label: `Product`,
  //   roles: [groupRolesConfig.admin, groupRolesConfig.product],
  //   children: [
  //     {
  //       key: `products/product`,
  //       icon: <FileTextOutlined />,
  //       label: "Product",
  //       roles: [groupRolesConfig.admin, groupRolesConfig.productDetail],
  //     },
  //     {
  //       key: `products/product-type`,
  //       icon: <ControlOutlined />,
  //       label: "Product Type",
  //       roles: [groupRolesConfig.admin, groupRolesConfig.productType],
  //     },]
  // },
];

export const menuSider = (user: any) => {
  const mapMenu = MenuSider.map((item: any) => {
    if (!item.children) {
      return {
        ...item,
        label: (
          <>
            <Link href={`/page/${item.key}`}>{item.label}</Link>
          </>
        ),
      };
    }
    return {
      ...item,
      children: item.children.map((itemChild: IMenuChild) => ({
        ...itemChild,
        label: (
          <>
            <Link href={`/page/${item.key}/${itemChild.key}`}>
              {itemChild.label}
            </Link>
          </>
        ),
      })),
    };
  });

  // if (user.groupRoles?.includes(groupRolesConfig.admin)) {
  //   return mapMenu;
  // }

  // return mapMenu.filter((item) => {
  //   if (user.module) {
  //     return item.roles.some((role: any) => user.module?.includes(role));
  //   }
  // });
  return mapMenu;
};

function replaceSpecialCharactersWithSpace(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, " ");
}

export const itemBreadcrumbMenu = (pathname: string) => {
  const currentPath = pathname.split("/")[2] ?? pathname.split("/")[1];
  return MenuSider?.filter((menu: any) => menu.key === currentPath).map(
    (item: any) => {
      if (item.children && item.children.length > 1) {
        const currentPath = pathname.split("/")[3];

        const childPath = item?.children.find(
          (x: any) =>
            x.label.toLowerCase() ===
            replaceSpecialCharactersWithSpace(currentPath.toLocaleLowerCase())
        );
        return [
          { title: <Link href={"/page"}>Home</Link> },
          { title: item.label },
          { title: childPath?.label },
        ];
      }
      return [
        { title: <Link href={"/page"}>Home</Link> },
        { title: item.label },
      ];
    }
  )[0];
};
