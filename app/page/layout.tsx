// "use client";

// import React, { useEffect, useState } from "react";
// import { redirect, usePathname } from "next/navigation";
// import Navigation from "@/components/Navigation";
// import { Layout, Menu, Breadcrumb, Spin, ConfigProvider } from "antd";
// import { itemBreadcrumbMenu, menuSider } from "@/config/menu";
// import { signIn, useSession } from "next-auth/react";
// import { UserProfileType } from "@/types";
// import config from "@/config";
// import { useRefreshToken } from "../lib/axios/hooks/useRefreshToken";
// import Image from "next/image";
// export default function MainLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { data: session } = useSession({
//     required: true,
//     onUnauthenticated() {
//       signIn();
//     },
//   });

//   // if (session?.user.module.length === 0) {
//   //   redirect("/authorized");
//   // }

//   const refreshToken = useRefreshToken();

//   useEffect(() => {
//     if (session) {
//       const renewTokenTask = setInterval(async () => {
//         await refreshToken();
//       }, config.refreshTokenIntervalInSeconds);
//       return () => {
//         clearTimeout(renewTokenTask);
//       };
//     }
//   }, []);

//   const [collapsed, setCollapsed] = useState(false);
//   const { Content, Sider } = Layout;
//   const pathname = usePathname();
//   const currentPath = pathname.split("/")[2];

//   if (!session) {
//     return <div className="flex justify-center items-center h-screen"></div>;
//   }

//   return (
//     <ConfigProvider
//     // theme={{
//     //   token: {
//     //     colorPrimary: "#00a191",
//     //     colorLink: "#008075",
//     //   },
//     //   components: { Layout: { colorBgLayout: "#e1e1e1 " } },
//     // }}
//     >
//       <Layout className=" min-h-screen h-full  ">
//         <Sider
//           width={200}
//           trigger={null}
//           collapsible
//           collapsed={collapsed}
//           className="hidden md:block "
//         >
//           <div className=" min-h-screen h-full bg-white">
//             <div className="flex justify-center bg-white py-4 ">
//               <Image
//                 width={0}
//                 height={0}
//                 sizes="100vw"
//                 style={
//                   !collapsed
//                     ? { width: "100px", height: "auto" }
//                     : { width: "50px", height: "auto" }
//                 }
//                 src="/spst.png"
//                 className={` h-auto`}
//                 alt={""}
//               />
//             </div>
//             {session.user && (
//               <Menu
//                 mode="inline"
//                 defaultSelectedKeys={[currentPath]}
//                 style={{ borderRight: 0 }}
//                 items={menuSider(session?.user)}
//               />
//             )}
//           </div>
//         </Sider>
//         <Layout>
//           <div className="w-full">
//             <Navigation
//               collapsed={collapsed}
//               setCollapsed={setCollapsed}
//               currentPath={currentPath}
//               user={session.user as UserProfileType}
//             />
//           </div>
//           <div className="flext justify-col w-full h-14 bg-white shadow mb-3">
//             <div className="mt-2 ml-2">
//               <Breadcrumb items={itemBreadcrumbMenu(pathname)} />
//             </div>
//           </div>
//           <Content
//             style={{
//               paddingBottom: 0,
//               paddingTop: 0,
//               paddingLeft: 10,
//               paddingRight: 10,
//               margin: 0,
//               marginBottom: 20,
//             }}
//           >
//             {children}
//           </Content>
//         </Layout>
//       </Layout>
//     </ConfigProvider>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import { Layout, Menu, Breadcrumb, ConfigProvider } from "antd";
import { itemBreadcrumbMenu, menuSider } from "@/config/menu"; // ✅ ใช้ useMenuSider
import { signIn, useSession } from "next-auth/react";
import { UserProfileType } from "@/types";
import config from "@/config";
import { useRefreshToken } from "../lib/axios/hooks/useRefreshToken";
import Image from "next/image";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });

  const refreshToken = useRefreshToken();

  useEffect(() => {
    if (session) {
      const renewTokenTask = setInterval(async () => {
        await refreshToken();
      }, config.refreshTokenIntervalInSeconds);
      return () => {
        clearTimeout(renewTokenTask);
      };
    }
  }, [session, refreshToken]);

  const [collapsed, setCollapsed] = useState(false);
  const { Content, Sider } = Layout;
  const pathname = usePathname();
  const currentPath = pathname.split("/")[2];

  // ✅ ดึงเมนูจาก hook
  const menus = menuSider();

  if (!session) {
    return <div className="flex justify-center items-center h-screen"></div>;
  }

  return (
    <ConfigProvider>
      <Layout className="min-h-screen h-full">
        <Sider
          width={200}
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="hidden md:block"
        >
          <div className="min-h-screen h-full bg-white">
            <div className="flex justify-center bg-white py-4">
              <Image
                width={0}
                height={0}
                sizes="100vw"
                style={
                  !collapsed
                    ? { width: "100px", height: "auto" }
                    : { width: "50px", height: "auto" }
                }
                src="/public/rpst.png"
                className="h-auto"
                alt=""
              />
            </div>
            <Menu
              mode="inline"
              defaultSelectedKeys={[currentPath]}
              style={{ borderRight: 0 }}
              items={menus}
            />
          </div>
        </Sider>
        <Layout>
          <div className="w-full">
            <Navigation
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              currentPath={currentPath}
              user={session.user as UserProfileType}
            />
          </div>
          <div className="flext justify-col w-full h-14 bg-white shadow mb-3">
            <div className="mt-2 ml-2">
              <Breadcrumb items={itemBreadcrumbMenu(pathname)} />
            </div>
          </div>
          <Content
            style={{
              paddingBottom: 0,
              paddingTop: 0,
              paddingLeft: 10,
              paddingRight: 10,
              margin: 0,
              marginBottom: 20,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
