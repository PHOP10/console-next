// lib/exportExcel.ts
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { SupportingResourceType } from "../../common";

export function exportSupportingResources(data: SupportingResourceType[]) {
  // map ข้อมูลเป็น header ภาษาไทย
  const exportData = data.map((item) => ({
    รหัส: item.code,
    ชื่อวัสดุ: item.name,
    สถานะ: item.status || "",
    วันที่ได้มา: new Date(item.acquiredDate).toLocaleDateString(),
    ประเภทการได้มา: item.acquisitionType || "",
    รายละเอียด: item.description || "",
    ผู้สร้าง: item.createdBy || "",
    สร้างเมื่อ: new Date(item.createdAt).toLocaleString(),
    อัปเดตเมื่อ: new Date(item.updatedAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet([]);

  // ใส่ title ไว้ A1
  XLSX.utils.sheet_add_aoa(worksheet, [["วัสดุสนับสนุนทั้งหมด"]], {
    origin: "A1",
  });

  // เติมข้อมูลเริ่มที่ A2
  XLSX.utils.sheet_add_json(worksheet, exportData, { origin: "A2" });

  const colCount = Object.keys(exportData[0] || {}).length;
  worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }];

  if (worksheet["A1"]) {
    worksheet["A1"].s = {
      alignment: { horizontal: "center", vertical: "center" },
      font: { bold: true, sz: 14 },
    };
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "วัสดุสนับสนุน");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true,
  });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, "SupportingResources.xlsx");
}
