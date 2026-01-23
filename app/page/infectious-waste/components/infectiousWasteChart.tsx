"use client";

import { Card, DatePicker, ConfigProvider, Typography } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import thTH from "antd/locale/th_TH";
import type { Dayjs } from "dayjs";
import { InfectiousWasteType } from "../../common";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import "./graph.css"; // (ถ้ามีไฟล์นี้)

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

dayjs.locale("th");
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;
const { Title: AntTitle } = Typography;

interface Props {
  data: InfectiousWasteType[];
}

export default function InfectiousWasteChart({ data }: Props) {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const filteredData = data.filter((item) => {
    if (!dateRange?.[0] || !dateRange?.[1]) return true;
    const discarded = dayjs(item.discardedDate);
    return (
      discarded.isSameOrAfter(dateRange[0], "day") &&
      discarded.isSameOrBefore(dateRange[1], "day")
    );
  });

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

  // ⭐⭐⭐ ส่วนจัดการสี (Color Palette) ⭐⭐⭐
  // คุณสามารถเปลี่ยนชุดสีตรงนี้ได้ตามใจชอบ (เลือกจากด้านบนมาวางทับได้เลย)
  const distinctColors = [
    { bg: "rgba(54, 162, 235, 0.6)", border: "#36A2EB" }, // ฟ้า
    { bg: "rgba(255, 99, 132, 0.6)", border: "#FF6384" }, // แดง/ชมพู
    { bg: "rgba(75, 192, 192, 0.6)", border: "#4BC0C0" }, // เขียวมิ้นต์
    { bg: "rgba(255, 206, 86, 0.6)", border: "#FFCE56" }, // เหลือง
    { bg: "rgba(153, 102, 255, 0.6)", border: "#9966FF" }, // ม่วง
    { bg: "rgba(255, 159, 64, 0.6)", border: "#FF9F40" }, // ส้ม
    { bg: "rgba(201, 203, 207, 0.6)", border: "#C9CBCF" }, // เทา
  ];

  const bgColors = chartData.map(
    (_, index) => distinctColors[index % distinctColors.length].bg,
  );
  const borderColors = chartData.map(
    (_, index) => distinctColors[index % distinctColors.length].border,
  );

  const chartJsData = {
    labels: chartData.map((item) => item.type),
    datasets: [
      {
        label: "น้ำหนัก (กก.)",
        data: chartData.map((item) => item.weight),
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2, // ขอบหนาขึ้นนิดนึงเพื่อให้สีตัดกันชัดเจน
        borderRadius: 8, // ขอบมน
        borderSkipped: false, // ให้เส้นขอบมีรอบด้าน (รวมด้านล่าง)
        hoverBackgroundColor: borderColors, // เวลาเอาเมาส์ชี้ให้สีเข้มขึ้น
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#333",
        bodyColor: "#666",
        borderColor: "rgba(0,0,0,0.1)",
        borderWidth: 1,
        titleFont: { size: 14, family: "Sarabun" },
        bodyFont: { size: 13, family: "Sarabun" },
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => {
            const dataIndex = context.dataIndex;
            const weight = chartData[dataIndex].weight.toLocaleString(
              undefined,
              { minimumFractionDigits: 1 },
            );
            const count = chartData[dataIndex].count.toLocaleString();
            return ` น้ำหนัก: ${weight} กก. (${count} รายการ)`;
          },
          labelTextColor: () => "#333",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: {
          color: "#f0f0f0", // สีเส้นตารางจางๆ
          tickLength: 10,
        },
        ticks: {
          color: "#8c8c8c",
          font: { family: "Sarabun" },
        },
        title: {
          display: true,
          text: "น้ำหนักรวม (กก.)",
          color: "#bfbfbf",
          font: { family: "Sarabun" },
        },
      },
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: {
          color: "#595959",
          font: { family: "Sarabun", size: 13 },
        },
      },
    },
    animation: {
      duration: 2000, // เพิ่มเวลา Animation ให้กราฟค่อยๆ ขึ้นอย่างนุ่มนวล
      easing: "easeOutQuart",
    },
  };

  return (
    <ConfigProvider locale={thTH}>
      <Card
        bordered={false}
        style={{
          borderRadius: "16px", // Card มนสวย
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)", // เงาฟุ้งๆ นุ่มนวล
          background: "#ffffff",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <AntTitle
            level={4}
            style={{ margin: 0, color: "#262626", fontFamily: "Sarabun", fontSize: 24}}
          >
            📊 สรุปปริมาณขยะติดเชื้อ
          </AntTitle>
          <RangePicker
            value={dateRange}
            onChange={(dates) =>
              setDateRange(dates ? (dates as [Dayjs, Dayjs]) : [null, null])
            }
            format="DD MMM BB"
            bordered={false}
            style={{
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
          />
        </div>

        <div style={{ height: "350px", width: "100%" }}>
          <Bar data={chartJsData} options={options} />
        </div>
      </Card>
    </ConfigProvider>
  );
}
