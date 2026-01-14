"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import ManageOfficialTravelRequestTable from "../components/manageOfficialTravelRequestTable";
import { userService } from "../../user/services/user.service";
import { UserType } from "../../common";

export default function page() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = officialTravelRequestService(intraAuth);
  const intraAuthUserService = userService(intraAuth);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [dataUser, setDataUser] = useState<UserType[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await intraAuthService.getOfficialTravelRequestQuery();
      const resUsers = await intraAuthUserService.getUserQuery();

      setData(res);
      setDataUser(resUsers);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถดึงข้อมูลรถได้");
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
      label: "ข้อมูลขอเดินทางไปราชการ",
      children: (
        <Card>
          <ManageOfficialTravelRequestTable
            data={data}
            loading={loading}
            fetchData={fetchData}
            dataUser={dataUser}
          />
        </Card>
      ),
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Tabs defaultActiveKey="1" items={items} />
      </Col>
    </Row>
  );
}
