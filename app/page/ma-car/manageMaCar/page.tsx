"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import ManageMaCarTable from "../components/manageMaCarTable";
import ManageCarTable from "../components/manageCarTable";
import { MaCarType, MasterCarType } from "../../common";

export default function manageMaCarPage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<MaCarType[]>([]); // เก็บข้อมูล MaCar
  const [dataCar, setDataCar] = useState<MasterCarType[]>([]); // เก็บข้อมูล MaCar
  const [dataUser, setDataUser] = useState<any[]>([]);

  // ฟังก์ชันดึงข้อมูล
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await intraAuthService.getMaCarQuery();
      const dataCar = await intraAuthService.getMasterCarQuery();
      const resUsers = await intraAuthService.getUserQuery();
      setDataUser(resUsers);
      setDataCar(dataCar);
      setData(res);
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
      label: "จัดการรายการจองรถ",
      children: (
        <Card>
          <ManageMaCarTable
            data={data}
            loading={loading}
            fetchData={fetchData}
            dataUser={dataUser}
            cars={dataCar}
          />
        </Card>
      ),
    },
    {
      key: "2",
      label: "จัดการรรถ",
      children: (
        <Card>
          <ManageCarTable
            dataCar={dataCar}
            loading={loading}
            setLoading={setLoading}
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
