"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "./services/user.service";
import { UserType } from "../common"; // UserType จาก common (ไม่สมบูรณ์)
import UserTable from "./components/userTable";
import UserForm from "./components/userForm";

import ProfileDetails from "./components/ProfileDetails"; // Import คอมโพเนนต์ ProfileDetails

export default function UserPage() {
    const intraAuth = useAxiosAuth();
    const intraAuthService = userService(intraAuth);

    const [loading, setLoading] = useState<boolean>(false);
    // แก้ไข: ใช้ any[] ชั่วคราว
    const [data, setData] = useState<any[]>([]); 

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await intraAuthService.getUserQuery();
            setData(res);
        } catch (err) {
            console.error(err);
            message.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const items: TabsProps["items"] = [
        {
            key: "1",
            label: "ข้อมูลผู้ใช้",
            children: (
                <Card bordered={false} bodyStyle={{ padding: 0 }} >
                    <UserTable
                        data={data}
                        loading={loading}
                        fetchData={fetchData}
                        setData={setData}
                    />
                </Card>
            ),
        },

        {                                   /* อันใหม่ ------------------------------------------- */
            key: "2", 
            label: "โปรไฟล์",
            children: (
                <Card> 
                    <ProfileDetails
                        data={data as any} 
                        loading={loading}
                        fetchData={fetchData}
                        setData={setData as any} 
                    />
                </Card>
            ),
        },
    ];

    return (
        <Row>
            <Col span={24}>
                <Card
                    bordered={false}
                    bodyStyle={{ padding: 0 }}
                    style={{
                        backgroundColor: "transparent", 
                        border: "none",
                        boxShadow: "none",
                    }}
                >
                    <Tabs defaultActiveKey="1" items={items} />
                </Card>
            </Col>
        </Row>
    );
}