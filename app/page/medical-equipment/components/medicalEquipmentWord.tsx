"use client";

import React from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Tooltip } from "antd"; // เอา Button ออกเพราะไม่ได้ใช้
import dayjs from "dayjs";
import "dayjs/locale/th";
import { FileWordOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { UserType } from "../../common";

// ตั้งค่า locale ภาษาไทย
dayjs.locale("th");

interface ExportMedicalEquipmentWordProps {
  record: any;
  allUsers?: UserType[];
}

const ExportMedicalEquipmentWord: React.FC<ExportMedicalEquipmentWordProps> = ({
  record,
  allUsers = [], // รับ props เพิ่ม
}) => {
  // 1. ย้าย useSession มาไว้ข้างบนสุด (Top Level)
  const { data: session } = useSession();

  const handleExport = async () => {
    try {
      // โหลด template Word
      const response = await fetch("/equipmentTemplate.docx");
      if (!response.ok) throw new Error("ไม่สามารถโหลด template.docx");

      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const foundUser = allUsers.find((u: any) => {
        const fullName = `${u.firstName} ${u.lastName}`;
        return fullName.trim() === record.createdBy?.trim();
      });

      const genderPrefix = foundUser
        ? foundUser.gender === "male"
          ? "นาย"
          : foundUser.gender === "female"
            ? "นาง"
            : foundUser.gender === "miss"
              ? "นางสาว"
              : (foundUser.gender ?? "-")
        : "-";

      const now = dayjs();
      const sentDateObj = record.sentDate ? dayjs(record.sentDate) : null;

      const data = {
        sentDate: sentDateObj
          ? `${sentDateObj.format("D MMMM")} ${sentDateObj.year() + 543}` // แปลงปีเอง
          : "-",
        sentD: now.format("D"),
        sentMM: now.format("MMMM"), // ใช้ locale th แล้วจะได้ มกราคม
        sentBBBB: now.year() + 543, // แก้จาก format('BBBB') เป็นบวกเลขเอง
        createdBy: record.createdBy,
        cb: genderPrefix,
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
    } catch (error) {
      console.error("Export Error:", error);
      alert("เกิดข้อผิดพลาดในการ Export ไฟล์");
    }
  };

  return (
    <Tooltip title="พิมพ์ใบส่งเครื่องมือ">
      <FileWordOutlined
        style={{
          fontSize: 18,
          // แก้ไขสีให้ถูกต้องตามสถานะ
          color: record.status === "pending" ? "#1677ff" : "#d9d9d9",
          cursor: record.status === "pending" ? "pointer" : "not-allowed",
          transition: "color 0.2s",
        }}
        onClick={() => {
          if (record.status === "pending") {
            handleExport();
          }
        }}
      />
    </Tooltip>
  );
};

export default ExportMedicalEquipmentWord;
