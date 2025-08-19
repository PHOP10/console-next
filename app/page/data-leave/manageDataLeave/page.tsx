"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveType, MasterLeaveType } from "../../common";
import { DataLeaveService } from "../services/dataLeave.service";
import ManagementDataLeaveTable from "../components/managementDataLeaveTable";
import ManagementMasterLeaveTable from "../components/managementMasterLeaveTable";

export default function ManageDataLeavePage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);

  const [loading, setLoading] = useState<boolean>(true);
  const [dataLeave, setDataLeave] = useState<DataLeaveType[]>([]);
  const [masterLeave, setMasterLeave] = useState<MasterLeaveType[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [dataLeaveRes, masterLeaveRes] = await Promise.all([
          intraAuthService.getDataLeaveQuery(),
          intraAuthService.getMasterLeaveQuery(),
        ]);

        setDataLeave(dataLeaveRes);
        setMasterLeave(masterLeaveRes);
      } catch (err) {
        message.error("ไม่สามารถดึงข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `จัดการข้อมูลการลา`,
      children: (
        <Card>
          <ManagementDataLeaveTable
            data={dataLeave}
            setDataLeave={setDataLeave}
            loading={loading}
            setLoading={setLoading}
          />
        </Card>
      ),
    },
    {
      key: "2",
      label: `จัดการข้อมูลประเภทลา`,
      children: (
        <Card>
          <ManagementMasterLeaveTable
            data={masterLeave}
            loading={loading}
            setLoading={setLoading}
            setMasterLeave={setMasterLeave}
            masterLeave={masterLeave}
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
