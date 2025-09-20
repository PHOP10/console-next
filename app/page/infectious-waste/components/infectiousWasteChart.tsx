"use client";

import { Card, DatePicker, ConfigProvider } from "antd";
import { useState, useEffect, useRef } from "react";
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

import "./graph.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

  // สีสำหรับแต่ละแท่น
  const colors = [
    "rgba(24, 144, 255, 0.8)",
    "rgba(82, 196, 26, 0.8)",
    "rgba(250, 173, 20, 0.8)",
    "rgba(245, 34, 45, 0.8)",
    "rgba(114, 46, 209, 0.8)",
    "rgba(19, 194, 194, 0.8)",
  ];

  const borderColors = [
    "rgba(24, 144, 255, 1)",
    "rgba(82, 196, 26, 1)",
    "rgba(250, 173, 20, 1)",
    "rgba(245, 34, 45, 1)",
    "rgba(114, 46, 209, 1)",
    "rgba(19, 194, 194, 1)",
  ];

  const chartJsData = {
    labels: chartData.map((item) => item.type),
    datasets: [
      {
        label: "น้ำหนัก (กก.)",
        data: chartData.map((item) => item.weight),
        backgroundColor: chartData.map(
          (_, index) => colors[index % colors.length]
        ),
        borderColor: chartData.map(
          (_, index) => borderColors[index % borderColors.length]
        ),
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // ซ่อน legend เพราะแต่ละแท่นมีสีต่างกัน
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: function (context: any[]) {
            return context[0].label;
          },
          label: function (context: any) {
            const dataIndex = context.dataIndex;
            const weight = chartData[dataIndex].weight;
            const count = chartData[dataIndex].count;
            return [`น้ำหนัก: ${weight} กก.`, `จำนวน: ${count} รายการ`];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#262626",
          font: {
            size: 14,
          },
        },
        title: {
          display: true,
          text: "น้ำหนัก (กก.)",
          color: "#262626",
          font: {
            size: 18,
            weight: "bold",
          },
          fontFamily: 'Sarabun, "Noto Sans Thai", Arial, sans-serif',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#262626",
          font: {
            size: 14,
          },
          maxRotation: 45,
          minRotation: 0,
        },
        title: {
          display: true,
          text: "ประเภทขยะ",
          color: "#262626",
          font: {
            size: 18,
            weight: "bold",
          },
        },
      },
    },
  };

  return (
    <ConfigProvider locale={thTH}>
      <Card
        className="infectious-card"
        title={
          <span
            style={{ color: "#0683e9", fontSize: "20px", fontWeight: "bold" }}
          >
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
        <div style={{ height: "400px" }}>
          <Bar data={chartJsData} options={options} />
        </div>
      </Card>
    </ConfigProvider>
  );
}
