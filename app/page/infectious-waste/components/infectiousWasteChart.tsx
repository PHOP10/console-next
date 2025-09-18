"use client";

import { Card, DatePicker, ConfigProvider } from "antd";
import { Column } from "@ant-design/plots";
import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import thTH from "antd/locale/th_TH";
import type { Dayjs } from "dayjs";
import { InfectiousWasteType } from "../../common";

import "./graph.css"; // ไฟล์ CSS สำหรับปรับแต่งกราฟ

dayjs.locale("th");
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

interface Props {
  data: InfectiousWasteType[];
}

export default function InfectiousWasteChart({ data }: Props) {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  // กรองข้อมูลตามช่วงวันที่
  const filteredData = data.filter((item) => {
    if (!dateRange?.[0] || !dateRange?.[1]) return true;
    const discarded = dayjs(item.discardedDate);
    return (
      discarded.isSameOrAfter(dateRange[0], "day") &&
      discarded.isSameOrBefore(dateRange[1], "day")
    );
  });

  // สรุปน้ำหนักและจำนวนของแต่ละประเภท
  const summaryMap: Record<string, { weight: number; count: number }> = {};
  filteredData.forEach((item) => {
    if (!summaryMap[item.wasteType]) {
      summaryMap[item.wasteType] = { weight: 0, count: 0 };
    }
    summaryMap[item.wasteType].weight += item.wasteWeight;
    summaryMap[item.wasteType].count += 1;
  });

  const chartData = Object.entries(summaryMap).map(([type, value]) => ({
    type,
    weight: value.weight,
    count: value.count,
  }));

  // กำหนดสีแต่ละประเภท
  const colorMap: Record<string, string> = {
    "ขยะติดเชื้อทั่วไป": "#1890ff", // น้ำเงิน
    "ขยะติดเชื้อมีคม": "#ff4d4f",  // แดง
  };

  const config = {
    data: chartData,
    xField: "type",
    yField: "weight",
    seriesField: "type",/* แยกแต่ละประเภทเป็นสีแยก */
    color: (datum: { type: string }) => colorMap[datum.type] || "#aaa", 
    label: {
      position: "top",
      style: {               /* ตัวเลขบนกราฟ */
        fontSize: 18,
        fontWeight: 700,
        fill: "#1a1a1a",
      },
    },
    tooltip: {
      customContent: (title: string, items: any[]) => {
        const item = items?.[0];
        if (!item) return null;
        const { data } = item;
        return `<div style="padding: 10px;">
          <strong>${title}</strong><br/>
          ${data.count} รายการ / ${data.weight} กก.
        </div>`;
      },
    },
    yAxis: { title: { text: "น้ำหนักรวม (กก.)" } },
    meta: {
      type: { alias: "ประเภทขยะ" },
      weight: { alias: "น้ำหนักรวม (กก.)" },
    },
    columnWidthRatio: 0.6,
    width: 1300,
    height: 400,
  };

  return (
    <ConfigProvider locale={thTH}>
      <Card
        className="infectious-card"
        title={
          <span style={{ color: "#0683e9", fontSize: "20px", fontWeight: "bold" }}>
            กราฟน้ำหนักขยะติดเชื้อรวมตามประเภท
          </span>
        }
        extra={
          <RangePicker
            value={dateRange}
            onChange={(dates) =>
              setDateRange(dates ? (dates as [Dayjs, Dayjs]) : [null, null])
            }
            format="DD MMMM YYYY"
            allowClear
            style={{
              fontSize: "14px",
              padding: "6px 10px",
              borderRadius: "6px",
            }}
          />
        }
      >
        <Column {...config} />
      </Card>
    </ConfigProvider>
  );
}
