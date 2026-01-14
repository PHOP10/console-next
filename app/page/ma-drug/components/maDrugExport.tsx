import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { MaDrugType } from "../../common"; // ตรวจสอบ path ให้ตรงกับโปรเจคของคุณ

export const exportMaDrugToExcel = async (data: MaDrugType) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ใบเบิกยา");

  // 1. ตั้งค่าความกว้างของคอลัมน์ (ให้พอดีกับหน้ากระดาษ)
  worksheet.columns = [
    { width: 8 }, // A: ลำดับ
    { width: 15 }, // B: Working Code
    { width: 35 }, // C: รายการยา
    { width: 15 }, // D: ขนาดบรรจุ
    { width: 12 }, // E: ราคา/หน่วย
    { width: 12 }, // F: คงเหลือ
    { width: 12 }, // G: จำนวนเบิก
    { width: 15 }, // H: หมายเหตุ
  ];

  // 2. ส่วนหัวกระดาษ (Header)
  // รวมเซลล์เพื่อทำชื่อหัวกระดาษ
  worksheet.mergeCells("A1:H1");
  const titleRow = worksheet.getCell("A1");
  titleRow.value = "ใบขอเบิกยาและเวชภัณฑ์ที่มิใช่ยา โรงพยาบาล..."; // ใส่ชื่อโรงพยาบาล
  titleRow.alignment = { vertical: "middle", horizontal: "center" };
  titleRow.font = { name: "Angsana New", family: 4, size: 16, bold: true };

  worksheet.mergeCells("A2:H2");
  const subTitleRow = worksheet.getCell("A2");
  subTitleRow.value = `กลุ่มงานเภสัชกรรม ประจำปีงบประมาณ ...`;
  subTitleRow.alignment = { vertical: "middle", horizontal: "center" };
  subTitleRow.font = { name: "Angsana New", family: 4, size: 14, bold: true };

  // 3. ข้อมูลใบเบิก (Information)
  worksheet.addRow([""]); // เว้นบรรทัด

  // สร้างฟังก์ชันช่วยใส่ข้อมูลหัวบิล
  const addInfoRow = (
    label1: string,
    val1: string,
    label2: string,
    val2: string
  ) => {
    const row = worksheet.addRow([label1, val1, "", "", label2, val2]);
    row.font = { name: "Angsana New", size: 14 };
    // ผสานเซลล์เพื่อให้ข้อความยาวๆ แสดงได้
    worksheet.mergeCells(`B${row.number}:D${row.number}`);
    worksheet.mergeCells(`F${row.number}:H${row.number}`);
  };

  addInfoRow(
    "เลขที่เบิก:",
    data.requestNumber,
    "วันที่:",
    new Date(data.requestDate).toLocaleDateString("th-TH")
  );
  addInfoRow(
    "หน่วยงาน:",
    data.requestUnit,
    "เบิกครั้งที่:",
    data.roundNumber.toString()
  );
  addInfoRow("ผู้ขอเบิก:", data.requesterName, "ผู้จัดยา:", data.dispenserName);

  worksheet.addRow([""]); // เว้นบรรทัด

  // 4. หัวตารางรายการยา (Table Header)
  const headerRow = worksheet.addRow([
    "ลำดับ",
    "Working Code",
    "รายการ",
    "ขนาดบรรจุ",
    "ราคา/หน่วย",
    "คงเหลือ",
    "จำนวนเบิก",
    "หมายเหตุ",
  ]);

  // จัด Style หัวตาราง
  headerRow.eachCell((cell) => {
    cell.font = { name: "Angsana New", size: 14, bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEEEEE" }, // สีพื้นหลังเทาอ่อนๆ
    };
  });

  // 5. วนลูปรายการยา (Data Rows)
  // ตรวจสอบว่ามี maDrugItems หรือไม่
  if (data.maDrugItems && data.maDrugItems.length > 0) {
    data.maDrugItems.forEach((item: any, index: number) => {
      // ดึงข้อมูลยาจาก relation (ต้องมั่นใจว่า Backend include มาแล้ว)
      const drugName = item.drug?.name || "-";
      const workingCode = item.drug?.workingCode || "-";
      const packaging = item.drug?.packagingSize || "-";
      const price = item.drug?.price || 0;
      const stock = item.drug?.quantity || 0; // ยอดคงเหลือปัจจุบัน

      const row = worksheet.addRow([
        index + 1,
        workingCode,
        drugName,
        packaging,
        price,
        stock,
        item.quantity, // จำนวนที่ขอเบิก
        item.note || "",
      ]);

      // จัด Style ข้อมูลในตาราง
      row.eachCell((cell) => {
        cell.font = { name: "Angsana New", size: 14 };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // จัด Alignment เฉพาะคอลัมน์
      row.getCell(1).alignment = { horizontal: "center" }; // ลำดับ
      row.getCell(2).alignment = { horizontal: "center" }; // Code
      row.getCell(5).alignment = { horizontal: "right" }; // ราคา
      row.getCell(6).alignment = { horizontal: "center" }; // คงเหลือ
      row.getCell(7).alignment = { horizontal: "center" }; // จำนวนเบิก
    });
  } else {
    worksheet.addRow(["ไม่พบรายการยา"]);
  }

  // 6. ส่วนท้าย (ลายเซ็น)
  worksheet.addRow([""]);
  worksheet.addRow([""]);

  const signRow = worksheet.addRow([
    "",
    "ลงชื่อ ........................................ ผู้เบิก",
    "",
    "",
    "",
    "ลงชื่อ ........................................ ผู้จ่าย",
    "",
  ]);
  signRow.font = { name: "Angsana New", size: 14 };
  signRow.alignment = { horizontal: "center" };
  worksheet.mergeCells(`B${signRow.number}:C${signRow.number}`);
  worksheet.mergeCells(`F${signRow.number}:G${signRow.number}`);

  // 7. สร้างไฟล์และดาวน์โหลด
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `ใบเบิกยา_${data.requestNumber}.xlsx`);
};
