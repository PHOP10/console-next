import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { MaDrugType } from "../../common";

export const exportMaDrugToExcel = async (data: MaDrugType) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ใบเบิกยา");

  // ✅ 1. ตั้งค่าหน้ากระดาษ A4 และขอบกระดาษ (Page Setup)
  worksheet.pageSetup = {
    paperSize: 9, // 9 = A4
    orientation: "portrait", // แนวตั้ง
    fitToPage: true, // บังคับพอดีหน้า
    fitToWidth: 1, // บีบความกว้างให้เหลือ 1 หน้า
    fitToHeight: 0, // ความสูงปล่อยไหล (เผื่อรายการยาเยอะจนล้นไปหน้า 2)
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.5,
      bottom: 0.5, // หน่วยเป็นนิ้ว (ลดขอบให้เหลือพื้นที่เยอะขึ้น)
      header: 0.3,
      footer: 0.3,
    },
  };

  // ✅ 2. ลดความกว้างคอลัมน์ให้กระชับลง (รวมกันอย่าให้เกินมากเกินไป)
  worksheet.columns = [
    { width: 6 }, // A: ลำดับ
    { width: 12 }, // B: Working Code
    { width: 25 }, // C: รายการยา
    { width: 10 }, // D: ขนาดบรรจุ
    { width: 10 }, // E: ราคา/หน่วย
    { width: 8 }, // F: คงเหลือ
    { width: 8 }, // G: จำนวนเบิก
    { width: 10 }, // H: จำนวนจ่าย
    { width: 15 }, // I: หมายเหตุ
  ];

  // ✅ 3. Helper ปรับลดขนาดฟอนต์ (Default 12)
  const setBaseFont = (
    target: ExcelJS.Cell | ExcelJS.Row,
    size = 12, // ลดจาก 14 เป็น 12
    bold = false,
  ) => {
    target.font = { name: "Angsana New", family: 4, size, bold };
  };

  const setBorder = (cell: ExcelJS.Cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  };

  // 4. ส่วนหัวกระดาษ (Title)
  worksheet.mergeCells("A1:I1");
  const titleRow = worksheet.getCell("A1");
  titleRow.value = "ใบขอเบิกยาและเวชภัณฑ์ที่มิใช่ยา โรงพยาบาลวังเจ้า";
  titleRow.alignment = { vertical: "middle", horizontal: "center" };
  setBaseFont(titleRow, 16, true); // หัวข้อใหญ่คงไว้ 16

  worksheet.mergeCells("A2:I2");
  const subTitleRow = worksheet.getCell("A2");
  subTitleRow.value = `กลุ่มงานเภสัชกรรม ประจำปีงบประมาณ 2569`;
  subTitleRow.alignment = { vertical: "middle", horizontal: "center" };
  setBaseFont(subTitleRow, 14, true);

  // 5. ข้อมูลใบเบิก
  worksheet.addRow([""]);

  // ✅ แก้ไขฟังก์ชันนี้: ขยับตำแหน่ง Cell และ Merge ใหม่เพื่อบีบเข้าตรงกลาง
  const addInfoRow = (l1: string, v1: string, l2: string, v2: string) => {
    // Array นี้จะลงช่อง: A(ว่าง), B(Label1), C(Value1), D, E, F(Label2), G(Value2), H, I(ว่าง)
    const row = worksheet.addRow(["", l1, v1, "", "", l2, v2, "", ""]);
    setBaseFont(row, 12);

    // --- ฝั่งซ้าย ---
    // Label 1 (ช่อง B): ชิดขวา เพื่อให้ตัวหนังสือวิ่งไปหาข้อมูล
    row.getCell(2).alignment = { horizontal: "right" };

    // Value 1 (ช่อง C): ชิดซ้าย + ย่อหน้า 1
    row.getCell(3).alignment = { horizontal: "left", indent: 1 };

    // --- ฝั่งขวา ---
    // Label 2 (ช่อง F): ชิดขวา
    row.getCell(6).alignment = { horizontal: "right" };

    // Value 2 (ช่อง G): ชิดซ้าย + ย่อหน้า 1
    row.getCell(7).alignment = { horizontal: "left", indent: 1 };

    // ✅ Merge ใหม่: เว้น A และ I ไว้เป็นขอบ
    // Value 1 รวม C-E
    worksheet.mergeCells(`C${row.number}:E${row.number}`);

    // Value 2 รวม G-H (เว้น I ไว้)
    worksheet.mergeCells(`G${row.number}:H${row.number}`);
  };

  addInfoRow(
    "เลขที่เบิก:",
    data.requestNumber || "-",
    "วันที่:",
    new Date(data.requestDate).toLocaleDateString("th-TH"),
  );
  addInfoRow(
    "หน่วยเบิก:",
    data.requestUnit || "-",
    "เบิกครั้งที่:",
    data.roundNumber?.toString() || "-",
  );

  const totalPrice = data.totalPrice
    ? `${Number(data.totalPrice).toLocaleString()} บาท`
    : "-";
  const totalItems = data.quantityUsed ? `${data.quantityUsed} รายการ` : "-";
  addInfoRow("จำนวนรายการ:", totalItems, "รวมเป็นเงิน:", totalPrice);

  worksheet.addRow([""]);

  // 6. ส่วนลายเซ็น
  const signLabelRow = worksheet.addRow([
    "",
    "ลงชื่อ ........................................ ผู้ขอเบิก",
    "",
    "",
    "",
    "ลงชื่อ ........................................ ผู้จ่ายยา",
    "",
    "",
    "",
  ]);
  const signNameRow = worksheet.addRow([
    "",
    `(${data.requesterName || "........................................"})`,
    "",
    "",
    "",
    `(${data.dispenserName || "........................................"})`,
    "",
    "",
    "",
  ]);

  [signLabelRow, signNameRow].forEach((row) => {
    setBaseFont(row, 12); // ลดฟอนต์ลายเซ็น
    row.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.mergeCells(`B${row.number}:E${row.number}`);
    worksheet.mergeCells(`F${row.number}:I${row.number}`);
  });

  worksheet.addRow([""]);

  // 7. หัวตาราง
  const headerRow = worksheet.addRow([
    "ลำดับ",
    "Working Code",
    "รายการ",
    "ขนาดบรรจุ",
    "ราคา",
    "คงเหลือ",
    "เบิก",
    "จ่าย",
    "หมายเหตุ",
  ]);

  headerRow.eachCell((cell) => {
    setBaseFont(cell, 12, true); // หัวตารางใช้ 12 ตัวหนา
    cell.alignment = { vertical: "middle", horizontal: "center" };
    setBorder(cell);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEEEEE" },
    };
  });

  // 8. ข้อมูลยา
  if (data.maDrugItems && data.maDrugItems.length > 0) {
    const groupedItems: Record<string, any[]> = {};

    data.maDrugItems.forEach((item: any) => {
      const typeName = item.drug?.drugType?.drugType || "อื่นๆ";
      if (!groupedItems[typeName]) groupedItems[typeName] = [];
      groupedItems[typeName].push(item);
    });

    let globalIndex = 1;

    Object.keys(groupedItems)
      .sort()
      .forEach((groupName) => {
        const groupRow = worksheet.addRow([groupName]);
        setBaseFont(groupRow, 12, true);
        groupRow.getCell(1).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        worksheet.mergeCells(`A${groupRow.number}:I${groupRow.number}`);
        groupRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDDEBF7" },
        };
        setBorder(groupRow.getCell(1));

        groupedItems[groupName].forEach((item) => {
          const row = worksheet.addRow([
            globalIndex++,
            item.drug?.workingCode || "-",
            item.drug?.name || "-",
            item.drug?.packagingSize || "-",
            item.drug?.price || 0,
            item.drug?.quantity || 0,
            item.quantity,
            "", // จำนวนจ่าย
            item.note || "",
          ]);

          row.eachCell((cell, colNumber) => {
            setBaseFont(cell, 12); // ข้อมูลยาใช้ฟอนต์ 12
            setBorder(cell);
            if (colNumber === 3 || colNumber === 9) {
              cell.alignment = { horizontal: "left" }; // ชื่อยากับหมายเหตุ ชิดซ้าย
              cell.alignment.wrapText = true; // ✅ ตัดบรรทัดอัตโนมัติถ้าชื่อยาวเกิน
            } else {
              cell.alignment = { horizontal: "center" };
            }
          });
        });
      });
  } else {
    const emptyRow = worksheet.addRow(["ไม่พบรายการยา"]);
    worksheet.mergeCells(`A${emptyRow.number}:I${emptyRow.number}`);
    emptyRow.getCell(1).alignment = { horizontal: "center" };
    setBaseFont(emptyRow, 12);
  }

  // 9. สร้างไฟล์
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `ใบเบิกยา_${data.requestNumber}.xlsx`);
};
