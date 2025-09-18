import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { SupportingResourceType } from "../../common";

export function exportSupportingResources(data: SupportingResourceType[]) {
  const exportData = data.map((item) => ({
    รหัส: item.code || "",
    "ยี่ห้อ/ชนิด/แบบ/ขนาดและลักษณะ": item.name || "",
    วันที่ได้มา: item.acquiredDate
      ? new Date(item.acquiredDate).toLocaleDateString("th-TH")
      : "",
    วิธีการได้มา: item.acquisitionType || "",
    รายละเอียด: item.description || "",
    ผู้เพิ่มข้อมูล: item.createdBy || "",
    วันที่เพิ่มข้อมูล: item.createdAt
      ? new Date(item.createdAt).toLocaleString("th-TH")
      : "",
  }));

  const worksheet = XLSX.utils.json_to_sheet([]);

  // Title A1
  XLSX.utils.sheet_add_aoa(worksheet, [["วัสดุสนับสนุนทั้งหมด"]], {
    origin: "A1",
  });

  // Data start at A2
  XLSX.utils.sheet_add_json(worksheet, exportData, { origin: "A2" });

  // Merge title across columns
  const colCount = Object.keys(exportData[0] || {}).length;
  worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }];
  // Set column widths (optional)
  worksheet["!cols"] = [
    { wch: 10 }, // รหัส
    { wch: 40 }, // ยี่ห้อ/ชนิด/แบบ/ขนาดและลักษณะ
    { wch: 15 }, // วันที่ได้มา
    { wch: 20 }, // วิธีการได้มา
    { wch: 30 }, // รายละเอียด
    { wch: 15 }, // ผู้เพิ่มข้อมูล
    { wch: 20 }, // วันที่เพิ่มข้อมูล
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "วัสดุสนับสนุน");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "SupportingResources.xlsx");
}
