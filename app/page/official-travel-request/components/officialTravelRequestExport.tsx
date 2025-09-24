"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Button } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

interface OfficialTravelExportWordProps {
  record: any;
}

const OfficialTravelExportWord: React.FC<OfficialTravelExportWordProps> = ({
  record,
}) => {
  const handleExport = async () => {
    try {
      // โหลด template Word
      const response = await fetch("/officialTravelTemplate.docx");
      if (!response.ok)
        throw new Error("ไม่สามารถโหลด officialTravelTemplate.docx");
      const arrayBuffer = await response.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // เตรียมข้อมูล
      const data = {
        id: record.id ?? "-",
        documentNo: record.documentNo ?? "-",
        title: record.title ?? "-",
        missionDetail: record.missionDetail ?? "-",
        location: record.location ?? "-",
        status: record.status ?? "-",
        cancelReason: record.cancelReason ?? "-",

        // วันเวลา
        startDate: record.startDate
          ? dayjs(record.startDate).format("D MMMM BBBB HH:mm")
          : "-",
        endDate: record.endDate
          ? dayjs(record.endDate).format("D MMMM BBBB HH:mm")
          : "-",
        createdAt: record.createdAt
          ? dayjs(record.createdAt).format("D MMMM BBBB HH:mm")
          : "-",
        updatedAt: record.updatedAt
          ? dayjs(record.updatedAt).format("D MMMM BBBB HH:mm")
          : "-",
        approvedDate: record.approvedDate
          ? dayjs(record.approvedDate).format("D MMMM BBBB HH:mm")
          : "-",

        // การอนุมัติ
        approvedByName: record.approvedByName ?? "-",

        // ข้อมูลรถ
        carName: record.MasterCar?.carName ?? "-",
        licensePlate: record.MasterCar?.licensePlate ?? "-",
        brand: record.MasterCar?.brand ?? "-",
        model: record.MasterCar?.model ?? "-",
        year: record.MasterCar?.year ?? "-",
      };

      // render ลง template
      doc.render(data);

      // บันทึกไฟล์
      const blob = doc.getZip().generate({ type: "blob" });
      saveAs(blob, `คำสั่งไปราชการ_${record.documentNo}.docx`);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <Button size="small" type="primary" onClick={handleExport}>
      Export Word
    </Button>
  );
};

export default OfficialTravelExportWord;
