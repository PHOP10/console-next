// DurableArticleExportExcel.tsx
"use client";

import React from "react";
import { Button, message } from "antd";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface DurableArticleExportExcelProps {
  record: any;
}

const DurableArticleExportExcel: React.FC<DurableArticleExportExcelProps> = ({
  record,
}) => {
  const handleExport = async () => {
    try {
      if (!record) {
        message.warning("ไม่พบข้อมูลที่จะส่งออก");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("ครุภัณฑ์");

      // กำหนดความกว้างคอลัมน์ที่เหมาะสม
      sheet.columns = [
        { key: "code", width: 25 },
        { key: "registrationNumber", width: 20 },
        { key: "acquiredDate", width: 18 },
        { key: "description", width: 50 },
        { key: "unitPrice", width: 18 },
        { key: "acquisitionType", width: 22 },
        { key: "usageLifespanYears", width: 20 },
        { key: "monthlyDepreciation", width: 20 },
        { key: "yearlyDepreciation", width: 20 },
        { key: "accumulatedDepreciation", width: 22 },
        { key: "netValue", width: 18 },
        { key: "type", width: 20 },
        { key: "attributes", width: 25 },
        { key: "category", width: 25 },
        { key: "documentId", width: 25 },
        { key: "responsibleAgency", width: 30 },
        { key: "note", width: 35 },
        { key: "createdName", width: 25 },
        { key: "createdAt", width: 20 },
        { key: "updatedAt", width: 20 },
      ];

      // แถวที่ 1: Title
      const titleRow = sheet.addRow(["ข้อมูลครุภัณฑ์"]);
      sheet.mergeCells("A1:T1");
      titleRow.height = 30;
      titleRow.font = { bold: true, size: 18, name: "TH Sarabun New" };
      titleRow.alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      titleRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      titleRow.getCell(1).font = {
        bold: true,
        size: 18,
        color: { argb: "FFFFFFFF" },
        name: "TH Sarabun New",
      };

      // แถวที่ 2: Header
      const headerRow = sheet.addRow([
        "รหัส",
        "เลขทะเบียน",
        "วันที่ได้มา",
        "รายละเอียด",
        "ราคาต่อหน่วย",
        "ประเภทการได้มา",
        "อายุการใช้งาน (ปี)",
        "ค่าเสื่อมต่อเดือน",
        "ค่าเสื่อมต่อปี",
        "ค่าเสื่อมสะสม",
        "มูลค่าสุทธิ",
        "ประเภท",
        "คุณลักษณะ",
        "หมวดหมู่",
        "รหัสเอกสาร",
        "หน่วยงานที่รับผิดชอบ",
        "หมายเหตุ",
        "ผู้บันทึก",
        "วันที่สร้าง",
        "วันที่แก้ไขล่าสุด",
      ]);

      headerRow.height = 25;
      headerRow.font = {
        bold: true,
        size: 14,
        name: "TH Sarabun New",
      };
      headerRow.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" },
      };

      // เพิ่มเส้นขอบให้ header
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // แถวที่ 3: Data
      const formatDate = (date: any) => {
        if (!date) return "-";
        try {
          return new Date(date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        } catch {
          return "-";
        }
      };

      const formatNumber = (num: any) => {
        if (num === null || num === undefined) return "-";
        return Number(num).toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      const dataRow = sheet.addRow({
        code: record.code || "-",
        registrationNumber: record.registrationNumber || "-",
        acquiredDate: formatDate(record.acquiredDate),
        description: record.description || "-",
        unitPrice: formatNumber(record.unitPrice),
        acquisitionType: record.acquisitionType || "-",
        usageLifespanYears: record.usageLifespanYears || "-",
        monthlyDepreciation: formatNumber(record.monthlyDepreciation),
        yearlyDepreciation: formatNumber(record.yearlyDepreciation),
        accumulatedDepreciation: formatNumber(record.accumulatedDepreciation),
        netValue: formatNumber(record.netValue),
        type: record.type || "-",
        attributes: record.attributes || "-",
        category: record.category || "-",
        documentId: record.documentId || "-",
        responsibleAgency: record.responsibleAgency || "-",
        note: record.note || "-",
        createdName: record.createdName || "-",
        createdAt: formatDate(record.createdAt),
        updatedAt: formatDate(record.updatedAt),
      });

      dataRow.height = 20;
      dataRow.font = {
        size: 14,
        name: "TH Sarabun New",
      };
      dataRow.alignment = {
        vertical: "middle",
        wrapText: true,
      };

      // จัด alignment ตามประเภทข้อมูล
      dataRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" }; // รหัส
      dataRow.getCell(2).alignment = { horizontal: "left", vertical: "middle" }; // เลขทะเบียน
      dataRow.getCell(3).alignment = {
        horizontal: "center",
        vertical: "middle",
      }; // วันที่
      dataRow.getCell(4).alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: true,
      }; // รายละเอียด
      dataRow.getCell(5).alignment = {
        horizontal: "right",
        vertical: "middle",
      }; // ราคา
      dataRow.getCell(6).alignment = { horizontal: "left", vertical: "middle" }; // ประเภทการได้มา
      dataRow.getCell(7).alignment = {
        horizontal: "center",
        vertical: "middle",
      }; // อายุการใช้งาน
      dataRow.getCell(8).alignment = {
        horizontal: "right",
        vertical: "middle",
      }; // ค่าเสื่อมเดือน
      dataRow.getCell(9).alignment = {
        horizontal: "right",
        vertical: "middle",
      }; // ค่าเสื่อมปี
      dataRow.getCell(10).alignment = {
        horizontal: "right",
        vertical: "middle",
      }; // ค่าเสื่อมสะสม
      dataRow.getCell(11).alignment = {
        horizontal: "right",
        vertical: "middle",
      }; // มูลค่าสุทธิ
      dataRow.getCell(12).alignment = {
        horizontal: "left",
        vertical: "middle",
      }; // ประเภท
      dataRow.getCell(13).alignment = {
        horizontal: "left",
        vertical: "middle",
      }; // คุณลักษณะ
      dataRow.getCell(14).alignment = {
        horizontal: "left",
        vertical: "middle",
      }; // หมวดหมู่
      dataRow.getCell(15).alignment = {
        horizontal: "left",
        vertical: "middle",
      }; // รหัสเอกสาร
      dataRow.getCell(16).alignment = {
        horizontal: "left",
        vertical: "middle",
      }; // หน่วยงาน
      dataRow.getCell(17).alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: true,
      }; // หมายเหตุ
      dataRow.getCell(18).alignment = {
        horizontal: "left",
        vertical: "middle",
      }; // ผู้บันทึก
      dataRow.getCell(19).alignment = {
        horizontal: "center",
        vertical: "middle",
      }; // วันที่สร้าง
      dataRow.getCell(20).alignment = {
        horizontal: "center",
        vertical: "middle",
      }; // วันที่แก้ไข

      // เพิ่มเส้นขอบให้ data row
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // ดาวน์โหลดไฟล์
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `ครุภัณฑ์_${
        record.code || "unknown"
      }_${new Date().getTime()}.xlsx`;
      saveAs(blob, fileName);

      message.success("ส่งออกข้อมูลสำเร็จ");
    } catch (error) {
      console.error("Export Error:", error);
      message.error("ไม่สามารถส่งออกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <Button
      size="small"
      type="primary"
      onClick={handleExport}
      disabled={!record}
      className="rounded-lg bg-green-600 hover:bg-green-700 border-none"
    >
      Export Excel
    </Button>
  );
};

export default DurableArticleExportExcel;
