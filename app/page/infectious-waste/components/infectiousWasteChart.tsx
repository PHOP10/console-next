"use client";

import { Card, DatePicker, ConfigProvider } from "antd";
import { Column } from "@ant-design/plots";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import thTH from "antd/locale/th_TH";
import type { Dayjs } from "dayjs";
import { InfectiousWasteType } from "../../common";

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

  const config = {
    data: chartData,
    xField: "type",
    yField: "weight",
    label: {
      position: "top",
      style: {
        fill: "#000",
      },
    },
    tooltip: {
      customContent: (title: string, items: any[]) => {
        const item = items?.[0];
        // console.log("Tooltip item:", item);
        if (!item) return null;
        const { data } = item;
        return `<div style="padding: 20px;">
        <strong>${title}</strong><br/>
        ${data.count} รายการ / ${data.weight} กก.
      </div>`;
      },
    },
    yAxis: {
      title: { text: "น้ำหนักรวม (กก.)" },
    },
    meta: {
      type: { alias: "ประเภทขยะ" },
      weight: { alias: "น้ำหนักรวม (กก.)" },
    },
    columnWidthRatio: 0.6, // กำหนดความหนาแท่ง (0-1)
    width: 1300, // ความกว้างกราฟ
    height: 400, // ความสูงกราฟ
  };

  return (
    <ConfigProvider locale={thTH}>
      <Card
        title="กราฟน้ำหนักขยะติดเชื้อรวมตามประเภท"
        extra={
          <RangePicker
            value={dateRange} // <--- ควบคุมค่า RangePicker
            onChange={(dates) =>
              setDateRange(dates ? (dates as [Dayjs, Dayjs]) : [null, null])
            }
            format="DD MMMM YYYY"
            allowClear
          />
        }
      >
        <Column {...config} />
      </Card>
    </ConfigProvider>
  );
}
