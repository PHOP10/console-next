"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Button, Tooltip } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { FileWordOutlined } from "@ant-design/icons";

dayjs.locale("th");

interface ExportMedicalEquipmentWordProps {
  record: any;
}

const ExportMedicalEquipmentWord: React.FC<ExportMedicalEquipmentWordProps> = ({
  record,
}) => {
  const handleExport = async () => {
    // โหลด template Word
    const response = await fetch("/equipmentTemplate.docx");
    if (!response.ok) throw new Error("ไม่สามารถโหลด template.docx");
    const arrayBuffer = await response.arrayBuffer();

    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true, // สำคัญ
    });
    // เตรียมข้อมูล
    const data = {
      sentDate: record.sentDate
        ? dayjs(record.sentDate).format("D MMMM BBBB")
        : "-",
      sentD: record.sentDate ? dayjs(record.sentDate).format("D") : "-",
      sentMM: record.sentDate
        ? dayjs(record.sentDate).locale("th").format("MMMM")
        : "-",
      sentBBBB: record.sentDate ? dayjs(record.sentDate).format("BBBB") : "-",
      createdBy: record.createdBy,
      items: (record.items || []).map((item: any, index: number) => ({
        index: index + 1,
        name: item.medicalEquipment?.equipmentName || "-",
        quantity: item.quantity || "-",
        note: item.note ? item.note.replace(/\r\n/g, "\n") : "",
      })),
    };

    doc.render(data);

    const blob = doc.getZip().generate({ type: "blob" });
    saveAs(blob, `รายการส่งเครื่องมือ_${record.id}.docx`);
  };

  return (
    <Tooltip title="พิมพ์ใบส่งเครื่องมือ">
      <FileWordOutlined
        style={{
          fontSize: 22,
          // ถ้าสถานะเป็น pending ให้เป็นสีฟ้า (Theme Word) ถ้าไม่ใช่ให้เป็นสีเทา
          color: record.status === "pending" ? "#1677ff" : "#d9d9d9",
          // ถ้าไม่ใช่ pending ให้ขึ้นเมาส์ห้ามกด
          cursor: record.status === "pending" ? "pointer" : "not-allowed",
          transition: "color 0.2s",
        }}
        onClick={() => {
          // เช็คเงื่อนไขก่อนทำงาน (แทน prop disabled)
          if (record.status === "pending") {
            handleExport();
          }
        }}
      />
    </Tooltip>
  );
};

export default ExportMedicalEquipmentWord;
