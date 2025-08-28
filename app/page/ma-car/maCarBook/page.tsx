"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message, Select } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import MaCarBookForm from "../components/maCarBookForm";

export default function MaCarPage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);

  const [loading, setLoading] = useState<boolean>(false);
  const [cars, setCars] = useState<any[]>([]);
  const [selectedCar, setSelectedCar] = useState<any>(null);

  // โหลดข้อมูลรถจาก MasterCar
  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await intraAuthService.getMasterCarQuery();
      setCars(res);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถดึงข้อมูลรถได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ยื่นแบบฟอร์ม",
      children: (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Select
              placeholder="เลือกชื่อรถเพื่อจอง"
              style={{ width: "100%" }}
              loading={loading}
              onChange={(id) => {
                const car = cars.find((c) => c.id === id);
                setSelectedCar(car);
              }}
            >
              {cars.map((car) => (
                <Select.Option key={car.id} value={car.id}>
                  {car.carName} ({car.licensePlate})
                </Select.Option>
              ))}
            </Select>
          </div>

          {selectedCar ? (
            <MaCarBookForm car={selectedCar} />
          ) : (
            <p style={{ color: "gray" }}>กรุณาเลือกรถก่อนทำการจอง</p>
          )}
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
