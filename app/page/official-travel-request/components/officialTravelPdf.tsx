"use client";

import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { Tooltip, message } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th";

// ✅ Import ไลบรารีสำหรับ PDF
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// ✅ Import Service
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../../user/services/user.service";
import { UserType } from "../../common";

dayjs.locale("th");

interface OfficialTravelPdfProps {
  record: any;
}

const OfficialTravelPdf: React.FC<OfficialTravelPdfProps> = ({ record }) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);
  const [userData, setUserData] = useState<UserType[]>([]);
  const now = dayjs();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await intraAuthService.getUserQuery();
        setUserData(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const toThaiNumber = (input: string | number | null | undefined): string => {
    if (input === null || input === undefined) return "-";
    const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
    return input
      .toString()
      .replace(/[0-9]/g, (digit) => thaiDigits[parseInt(digit)]);
  };

  const formatThaiDate = (date: string | Date) => {
    if (!date) return "-";
    const d = dayjs(date);
    return `${d.format("D")} ${d.format("MMMM")} ${toThaiNumber(d.year() + 543)} เวลา ${d.format("HH:mm")} น.`;
  };

  // 🚀 ฟังก์ชันตัดคำภาษาไทยอัจฉริยะ ปัดบรรทัดเมื่อเกินความกว้าง
  const wrapThaiText = (
    text: string,
    maxWidth: number,
    font: any,
    fontSize: number,
  ): string[] => {
    if (!text) return [];

    // ใช้ Intl.Segmenter ตัดเป็นคำๆ (ใส่ any ครอบเพื่อหลบ TypeScript Error)
    const segmenter = new (Intl as any).Segmenter("th", {
      granularity: "word",
    });
    const segments = segmenter.segment(text);

    // แปลงผลลัพธ์ให้เป็น Array ธรรมดา เพื่อให้ TypeScript ยอมให้วนลูปได้
    const segmentArray = Array.from(segments as any);

    let lines: string[] = [];
    let currentLine = "";

    for (const item of segmentArray) {
      const segment = (item as any).segment; // ดึงคำออกมา
      const testLine = currentLine + segment;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine); // ถ้ากว้างเกิน ให้ดันของเก่าเก็บเป็นบรรทัดใหม่
        currentLine = segment; // เอาคำใหม่ขึ้นบรรทัดถัดไป
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const handleExportPdf = async () => {
    message.loading({
      content: "กำลังโหลด PDF...",
      key: "exportPdf",
    });

    try {
      // 1. โหลดแบบฟอร์ม PDF เปล่า
      const pdfUrl = "/officialTravelRequestTemplatePdf.pdf"; // 🎯 อย่าลืมเตรียมไฟล์นี้นะครับ
      const pdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());

      // 2. โหลดฟอนต์ TH Sarabun New
      const fontUrl = "/fonts/THSarabunNew.ttf";
      const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());

      // 3. เริ่มเอกสาร
      const pdfDoc = await PDFDocument.load(pdfBytes);
      pdfDoc.registerFontkit(fontkit);
      const customFont = await pdfDoc.embedFont(fontBytes);
      const firstPage = pdfDoc.getPages()[0];

      const textSize = 16;
      const textColor = rgb(0, 0, 0);

      // --- เตรียมข้อมูล (เหมือนใน Word) ---
      const creator =
        userData.find((u) => u.userId === record.createdById) ||
        userData.find(
          (u) => `${u.firstName} ${u.lastName}` === record.createdName,
        );

      const creatorFullName = creator
        ? `${creator.firstName} ${creator.lastName}`
        : record.createdName || "-";

      const genderPrefix = creator
        ? creator.gender === "male"
          ? "นาย"
          : creator.gender === "female"
            ? "นาง"
            : creator.gender === "miss"
              ? "นางสาว"
              : (creator.gender ?? "-")
        : "-";

      const userPosition = creator?.position || "ไม่ระบุตำแหน่ง";

      const passengerList = Array.isArray(record.passengerNames)
        ? record.passengerNames.map((userId: string, i: number) => {
            const user = userData.find((u) => u.userId === userId);
            let prefix =
              user?.gender === "male"
                ? "นาย"
                : user?.gender === "female"
                  ? "นาง"
                  : user?.gender === "miss"
                    ? "นางสาว"
                    : "";
            return {
              index: toThaiNumber(i + 1),
              name: user
                ? `${prefix}${user.firstName} ${user.lastName}`
                : "(ไม่พบชื่อ)",
              position: user?.position ?? "-",
            };
          })
        : [];

      // ---------------------------------------------------------
      // 🎯 ส่วนเล็งพิกัด (X, Y)
      // ---------------------------------------------------------

      // ส่วนหัว
      firstPage.drawText(toThaiNumber(record.documentNo ?? "-"), {
        x: 90,
        y: 710,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(toThaiNumber(dayjs(record.createdAt).format("D")), {
        x: 345,
        y: 708,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(dayjs(record.createdAt).format("MMMM"), {
        x: 392,
        y: 708,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(toThaiNumber(dayjs(record.createdAt).year() + 543), {
        x: 460,
        y: 708,
        size: textSize,
        font: customFont,
      });

      // ผู้รับและผู้ขอ
      firstPage.drawText(record.recipient ?? "-", {
        x: 90,
        y: 660,
        size: textSize,
        font: customFont,
      }); //เรียน
      firstPage.drawText(`${genderPrefix}${creatorFullName ?? "-"}`, {
        x: 182,
        y: 636,
        size: textSize,
        font: customFont,
      }); //ชื่อ
      firstPage.drawText(userPosition, {
        x: 350,
        y: 636,
        size: textSize,
        font: customFont,
      }); //ตำแหน่ง

      firstPage.drawText(toThaiNumber(record.passengers ?? "0"), {
        x: 150,
        y: 620,
        size: textSize,
        font: customFont,
      }); //จำนวน

      // 🎯 ลูปรายชื่อผู้โดยสาร
      let currentY = 585; // เริ่มต้นบรรทัดแรกของคณะผู้ร่วมเดินทาง
      passengerList.forEach((p: any) => {
        firstPage.drawText(`${p.index}. ${p.name}`, {
          x: 150,
          y: currentY,
          size: textSize,
          font: customFont,
        });
        firstPage.drawText(p.position, {
          x: 375,
          y: currentY,
          size: textSize,
          font: customFont,
        });
        currentY -= 20; // ดันบรรทัดถัดไปลงทีละ 20 แต้ม
      });

      // 🎯 ส่วนที่ข้อความอาจจะยาว: Mission Detail (จุดประสงค์)

      const missionText = record.missionDetail ?? "-";

      // ใช้ฟังก์ชันปัดบรรทัด กำหนดความกว้างสูงสุดที่ 300 แต้ม (ลองปรับได้)
      const missionLines = wrapThaiText(missionText, 180, customFont, textSize);

      firstPage.drawText("/", {
        x: 133,
        y: 455,
        size: textSize,
        font: customFont,
      }); // ติ๊กถูกขออนุมัติเดินทาง

      // ลูปพิมพ์จุดประสงค์ทีละบรรทัด
      let missionY = 455;
      // ลูปพิมพ์จุดประสงค์ทีละบรรทัด
      missionLines.forEach((line, index) => {
        // บรรทัดแรก ให้เยื้องไปต่อท้ายคำว่า "มีความประสงค์..." ส่วนบรรทัดถัดไปให้ชิดซ้าย
        const xPos = index === 0 ? 380 : 56.5;

        firstPage.drawText(line, {
          x: xPos,
          y: missionY, // 🎯 เปลี่ยนมาใช้ตัวแปร missionY แทนเลข 455 ตายตัว
          size: textSize,
          font: customFont,
        });

        // 🎯 พิมพ์เสร็จ 1 บรรทัด สั่งให้ Y ลดลง 20 แต้ม เพื่อปัดบรรทัดถัดไปลงมา
        missionY -= 18;
      });

      // วันที่และสถานที่ (เลื่อน Y ลงมาตามตัวแปร currentY อัตโนมัติ)
      firstPage.drawText(
        record.startDate ? formatThaiDate(record.startDate) : "-",
        { x: 115, y: 419, size: textSize, font: customFont },
      ); //วันที่

      firstPage.drawText(record.location ?? "-", {
        x: 277,
        y: 419,
        size: textSize,
        font: customFont,
      }); //สถถานที่

      // 🎯 ส่วนตารางยานพาหนะ
      const checkMark = "/";
      if (record.travelType?.includes("official")) {
        firstPage.drawText(checkMark, {
          x: 64.5,
          y: 400.5,
          size: textSize,
          font: customFont,
        });
        firstPage.drawText(
          toThaiNumber(record.MasterCar?.licensePlate ?? "-"),
          { x: 213, y: 402.5, size: textSize, font: customFont },
        );
        firstPage.drawText(`${genderPrefix}${creatorFullName ?? "-"}`, {
          x: 315,
          y: 402.5,
          size: textSize,
          font: customFont,
        });
      }
      currentY -= 20;

      if (record.travelType?.includes("bus"))
        firstPage.drawText(checkMark, {
          x: 64.5,
          y: 383,
          size: textSize,
          font: customFont,
        });
      if (record.travelType?.includes("plane"))
        firstPage.drawText(checkMark, {
          x: 254.5,
          y: 383,
          size: textSize,
          font: customFont,
        });
      if (record.travelType?.includes("private")) {
        firstPage.drawText(checkMark, {
          x: 362.5,
          y: 383,
          size: textSize,
          font: customFont,
        });
        firstPage.drawText(toThaiNumber(record.privateCarId ?? "-"), {
          x: 63,
          y: 366.3,
          size: textSize,
          font: customFont,
        });
      }
      currentY -= 20;

      if (record.travelType?.includes("other")) {
        firstPage.drawText(checkMark, {
          x: 147.5,
          y: 365,
          size: textSize,
          font: customFont,
        });
        firstPage.drawText(record.otherTravelType ?? "-", {
          x: 210,
          y: 366.3,
          size: textSize,
          font: customFont,
        });
      }
      firstPage.drawText(
        record.endDate ? formatThaiDate(record.endDate) : "-",
        { x: 399, y: 365, size: textSize, font: customFont },
      ); ///วันที่สิ้นสุด

      currentY -= 40; // ขยับลงมาตรงส่วนงบประมาณ

      // งบประมาณ
      const bdg = record.budget;
      if (bdg === "งบกลาง")
        firstPage.drawText(checkMark, {
          x: 65.5,
          y: 328.5,
          size: textSize,
          font: customFont,
        });
      if (bdg === "งบผู้จัด")
        firstPage.drawText(checkMark, {
          x: 177.5,
          y: 328.5,
          size: textSize,
          font: customFont,
        });
      if (bdg === "งบโครงการ")
        firstPage.drawText(checkMark, {
          x: 245,
          y: 328.5,
          size: textSize,
          font: customFont,
        });
      if (bdg === "เงินบำรุง")
        firstPage.drawText(checkMark, {
          x: 360,
          y: 328.5,
          size: textSize,
          font: customFont,
        });
      if (bdg === "ไม่ขอเบิก")
        firstPage.drawText(checkMark, {
          x: 465,
          y: 328.5,
          size: textSize,
          font: customFont,
        });

      firstPage.drawText(`${genderPrefix}${creatorFullName ?? "-"}`, {
        x: 345,
        y: 262,
        size: textSize,
        font: customFont,
      }); // ชื่อผู้ขออนุญาต

      // 4. บันทึก
      const pdfBytesSaved = await pdfDoc.save();
      const blob = new Blob([pdfBytesSaved as any], {
        type: "application/pdf",
      });
      saveAs(blob, `ขอไปราชการ_${record.documentNo || record.id}.pdf`);

      message.success({ content: "ดาวน์โหลด PDF สำเร็จ!", key: "exportPdf" });
    } catch (error) {
      console.error("Export PDF error:", error);
      message.error({
        content: "เกิดข้อผิดพลาดในการสร้าง PDF",
        key: "exportPdf",
      });
    }
  };

  return (
    <Tooltip title={"พิมพ์ (PDF)"}>
      <FilePdfOutlined
        style={{
          fontSize: 18,
          color: record.status === "approve" ? "#ff4d4f" : "#d9d9d9",
          cursor: record.status === "approve" ? "pointer" : "not-allowed",
          opacity: record.status === "approve" ? 1 : 0.45,
          transition: "all 0.2s",
        }}
        onClick={() => {
          if (record.status === "approve") handleExportPdf();
        }}
      />
    </Tooltip>
  );
};

export default OfficialTravelPdf;
