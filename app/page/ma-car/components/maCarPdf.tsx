"use client";

import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { Tooltip, message } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th";

// ✅ Import ไลบรารีสำหรับเจาะรูเติมคำ
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// ✅ Import Service ของคุณ
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../../user/services/user.service";
import { UserType } from "../../common";

dayjs.locale("th");

interface MaCarPdfProps {
  record: any;
}

const MaCarPdf: React.FC<MaCarPdfProps> = ({ record }) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);
  const [userData, setUserData] = useState<UserType[]>([]);

  const fetchData = async () => {
    try {
      const res = await intraAuthService.getUserQuery();
      setUserData(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toThaiNumber = (input: string | number | undefined | null): string => {
    if (input === undefined || input === null || input === "") return "";
    const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
    return input
      .toString()
      .replace(/[0-9]/g, (digit) => thaiDigits[parseInt(digit)]);
  };

  const toArabicNumber = (
    input: string | number | undefined | null,
  ): string => {
    if (input === undefined || input === null || input === "") return "";
    return input.toString();
  };

  const formatThaiDate = (date: string | Date | undefined) => {
    if (!date) return "....................";
    const d = dayjs(date);
    const day = toThaiNumber(d.format("D"));
    const month = d.format("MMMM");
    const year = toThaiNumber(d.year() + 543);
    return `${day} ${month} ${year}`;
  };

  // 🚀 ฟังก์ชันหลัก: โหลด PDF เปล่า -> ฝังฟอนต์ -> พิมพ์ข้อความทับ
  const handleExportPdf = async () => {
    message.loading({ content: "กำลังโหลด PDF...", key: "export" });

    try {
      // 1. โหลดไฟล์ PDF ฟอร์มเปล่า (เตรียมไฟล์ชื่อ maCarTemplatePdf.pdf ไว้ใน public นะครับ)
      const pdfUrl = "/maCarTemplatePdf.pdf";
      const pdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());

      // 2. โหลดไฟล์ฟอนต์ TH Sarabun New
      const fontUrl = "/fonts/THSarabunNew.ttf";
      const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());

      // 3. เริ่มสร้างเอกสาร PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);
      pdfDoc.registerFontkit(fontkit);
      const customFont = await pdfDoc.embedFont(fontBytes);

      // 4. ดึงหน้าแรกของ PDF มาวาด
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const textSize = 16;
      const textColor = rgb(0, 0, 0);

      // --- 🛠️ เตรียมข้อมูลทั้งหมด (ลอจิกเดียวกับฝั่ง Word) ---
      if (userData.length === 0) {
        const res = await intraAuthService.getUserQuery();
        setUserData(res);
      }

      const creator = userData.find((u) => {
        if (record.createdById) {
          return u.userId === record.createdById;
        }

        return `${u.firstName} ${u.lastName}` === record.createdName;
      });

      const creatorFullName = creator
        ? `${creator.firstName} ${creator.lastName}`
        : record.createdName || "-";

      // โค้ดแปลงคำนำหน้า (ของคุณเขียนถูกเป๊ะอยู่แล้วครับ ใช้ของเดิมได้เลย)
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
            let prefix = "";
            if (user) {
              if (user.gender === "male") prefix = "นาย";
              else if (user.gender === "female") prefix = "นาง";
              else if (user.gender === "miss") prefix = "นางสาว";
            }
            return {
              index: toThaiNumber(i + 1),
              name: user
                ? `${prefix}${user.firstName} ${user.lastName}`
                : "(ไม่พบชื่อ)",
              position: user?.position ?? "-",
            };
          })
        : [];

      const standardBudgets = ["งบกลาง", "งบโครงการ", "งบผู้จัด", "เงินบำรุง"];
      const formattedBudget = record.budget
        ? toThaiNumber(
            record.budget.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            }),
          )
        : "-";

      // ---------------------------------------------------------
      // 🎯 ส่วนเล็งพิกัด (อ้างอิงจากแบบฟอร์ม PDF ของคุณ)
      // ---------------------------------------------------------
      //   const textSize = 15;

      // 1. Checkbox ส่วนหัว (ประเภทการขอใช้รถ)
      const yTopBox = 752;
      firstPage.drawText("(  )", {
        x: 90,
        y: yTopBox,
        size: 18,
        font: customFont,
      }); // ในจังหวัด
      firstPage.drawText("(  )", {
        x: 205,
        y: yTopBox,
        size: 18,
        font: customFont,
      }); // นอกจังหวัด
      firstPage.drawText("(  )", {
        x: 322,
        y: yTopBox,
        size: 18,
        font: customFont,
      }); // แผนปกติ
      firstPage.drawText("(  )", {
        x: 451,
        y: yTopBox,
        size: 18,
        font: customFont,
      }); // แผนด่วน

      if (record.typeName?.includes("ในจังหวัด"))
        firstPage.drawText("/", {
          x: 95,
          y: yTopBox,
          size: 18,
          font: customFont,
        });
      if (record.typeName?.includes("นอกจังหวัด"))
        firstPage.drawText("/", {
          x: 210,
          y: yTopBox,
          size: 18,
          font: customFont,
        });
      if (record.typeName?.includes("แผนปกติ"))
        firstPage.drawText("/", {
          x: 327,
          y: yTopBox,
          size: 18,
          font: customFont,
        });
      if (record.typeName?.includes("แผนด่วน"))
        firstPage.drawText("/", {
          x: 456,
          y: yTopBox,
          size: 18,
          font: customFont,
        });

      // 2. วันที่เขียน
      const yDate = 728;
      firstPage.drawText(toThaiNumber(dayjs(record.createdAt).format("D")), {
        x: 350,
        y: yDate,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(dayjs(record.createdAt).format("MMMM"), {
        x: 405,
        y: yDate,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(toThaiNumber(dayjs(record.createdAt).year() + 543), {
        x: 490,
        y: yDate,
        size: textSize,
        font: customFont,
      });

      // 3. ข้อมูลผู้ขออนุญาต
      firstPage.drawText(`${genderPrefix}${creatorFullName || "-"}`, {
        x: 140,
        y: 681,
        size: textSize,
        font: customFont,
      }); // ข้าพเจ้า
      firstPage.drawText(userPosition, {
        x: 325,
        y: 681,
        size: textSize,
        font: customFont,
      }); // ตำแหน่ง

      // 4. รายละเอียดการเดินทาง
      firstPage.drawText(record.purpose ?? "-", {
        x: 110,
        y: 662.5,
        size: textSize,
        font: customFont,
      }); // (ไปไหน)
      firstPage.drawText(record.destination ?? "-", {
        x: 88,
        y: 644.5,
        size: textSize,
        font: customFont,
      }); // ณ
      firstPage.drawText(toThaiNumber(record.passengers ?? "-"), {
        x: 497,
        y: 644.5,
        size: textSize,
        font: customFont,
      }); // จำนวนนั่ง

      firstPage.drawText(
        record.dateStart ? formatThaiDate(record.dateStart) : "-",
        { x: 117, y: 627, size: textSize, font: customFont },
      ); // ในวันที่
      firstPage.drawText(
        record.dateStart ? dayjs(record.dateStart).format("HH:mm") : "-",
        { x: 230, y: 627, size: textSize, font: customFont },
      ); // เวลาเริ่ม
      firstPage.drawText(
        record.dateEnd ? formatThaiDate(record.dateEnd) : "-",
        { x: 355, y: 627, size: textSize, font: customFont },
      ); // ถึงวันที่
      firstPage.drawText(
        record.dateEnd ? dayjs(record.dateEnd).format("HH:mm") : "-",
        { x: 475, y: 627, size: textSize, font: customFont },
      ); // เวลาสิ้นสุด

      // 5. ประเภทการเบิกจ่ายน้ำมัน (วาดกล่อง ☐ รอไว้)
      const yBudget = 606.5;
      const bCenter = 189,
        bProject = 240,
        bHost = 308,
        bIncome = 361.5,
        bOther = 415.5;
      firstPage.drawText("(  )", {
        x: bCenter,
        y: yBudget,
        size: 16,
        font: customFont,
      });
      firstPage.drawText("(  )", {
        x: bProject,
        y: yBudget,
        size: 16,
        font: customFont,
      });
      firstPage.drawText("(  )", {
        x: bHost,
        y: yBudget,
        size: 16,
        font: customFont,
      });
      firstPage.drawText("(  )", {
        x: bIncome,
        y: yBudget,
        size: 16,
        font: customFont,
      });
      firstPage.drawText("(  )", {
        x: bOther,
        y: yBudget,
        size: 16,
        font: customFont,
      });

      if (record.budget === "งบกลาง")
        firstPage.drawText("/", {
          x: bCenter + 4,
          y: yBudget,
          size: 16,
          font: customFont,
        });
      else if (record.budget === "งบโครงการ")
        firstPage.drawText("/", {
          x: bProject + 4,
          y: yBudget,
          size: 16,
          font: customFont,
        });
      else if (record.budget === "งบผู้จัด")
        firstPage.drawText("/", {
          x: bHost + 4,
          y: yBudget,
          size: 16,
          font: customFont,
        });
      else if (record.budget === "เงินบำรุง")
        firstPage.drawText("/", {
          x: bIncome + 4,
          y: yBudget,
          size: 16,
          font: customFont,
        });
      else {
        firstPage.drawText("/", {
          x: bOther + 4,
          y: yBudget,
          size: 16,
          font: customFont,
        });
        firstPage.drawText(record.budget || "-", {
          x: 510,
          y: yBudget + 2,
          size: textSize,
          font: customFont,
        }); // พิมพ์ชื่องบอื่นๆ
      }

      // 6. พนักงานขับรถ
      const yDriver = 588;
      firstPage.drawText("(  )", {
        x: 91,
        y: yDriver,
        size: 16,
        font: customFont,
      }); // ขอพนักงาน
      firstPage.drawText("(  )", {
        x: 222,
        y: yDriver,
        size: 16,
        font: customFont,
      }); // ไม่ขอ

      if (record.driver === "yes") {
        firstPage.drawText("/", {
          x: 95,
          y: yDriver,
          size: 16,
          font: customFont,
        });
      } else {
        firstPage.drawText("/", {
          x: 227,
          y: yDriver,
          size: 16,
          font: customFont,
        });
      }

      firstPage.drawText(`${genderPrefix}${creatorFullName}`, {
        x: 435,
        y: 590,
        size: textSize,
        font: customFont,
      });

      firstPage.drawText(`${genderPrefix}${creatorFullName}`, {
        x: 190,
        y: 169,
        size: textSize,
        font: customFont,
      });

      // ---------------------------------------------------------
      // 🎯 7. ลูปรายชื่อผู้โดยสาร (ทีเด็ดอยู่ตรงนี้ครับ)
      // ---------------------------------------------------------
      let currentY = 550; // เริ่มต้นบรรทัดแรกของรายชื่อผู้โดยสาร

      if (passengerList.length > 0) {
        passengerList.forEach((p: any, idx: number) => {
          // พิมพ์ชื่อ (คอลัมน์ซ้าย)
          firstPage.drawText(`${p.index}. ${p.name}`, {
            x: 120,
            y: currentY,
            size: textSize,
            font: customFont,
          });
          // พิมพ์ตำแหน่ง (คอลัมน์ขวา)
          firstPage.drawText(`ตำแหน่ง  ${p.position}`, {
            x: 300,
            y: currentY,
            size: textSize,
            font: customFont,
          });

          currentY -= 20; // 🎯 ขึ้นบรรทัดใหม่ ขยับ Y ลงมา 20 แต้ม
        });
      }

      // 8. ชื่อผู้ขออนุญาต (ใต้ลายเซ็น)
      firstPage.drawText(`${genderPrefix}${creatorFullName || "-"}`, {
        x: 350,
        y: 353,
        size: textSize,
        font: customFont,
      });

      // 9. ส่วนยานพาหนะด้านล่างสุด (ผู้ตรวจสอบ)
      const yCarInfo = 187.5;
      firstPage.drawText(record.masterCar?.licensePlate ?? "-", {
        x: 348,
        y: yCarInfo,
        size: textSize,
        font: customFont,
      }); // ทะเบียน

      firstPage.drawText(toThaiNumber(record.masterCar?.numberType ?? "-"), {
        x: 538,
        y: yCarInfo,
        size: textSize,
        font: customFont,
      }); //หมายเลข

      firstPage.drawText("(  )", {
        x: 476,
        y: 168,
        size: 16,
        font: customFont,
      }); // เบนซิน
      firstPage.drawText("(  )", {
        x: 524,
        y: 168,
        size: 16,
        font: customFont,
      }); // ดีเซล
      firstPage.drawText("(  )", {
        x: 77,
        y: 149,
        size: 16,
        font: customFont,
      }); // แก๊สโซฮอล์ 91

      // สมมติการติ๊กประเภทน้ำมัน (แก้ตาม Field จริงของคุณได้เลยครับ)
      if (record.masterCar?.fuelType === "เบนซิน")
        firstPage.drawText("/", {
          x: 479,
          y: 167.5,
          size: 16,
          font: customFont,
        });
      if (record.masterCar?.fuelType === "ดีเซล")
        firstPage.drawText("/", {
          x: 529,
          y: 167.5,
          size: 16,
          font: customFont,
        });
      if (record.masterCar?.fuelType?.includes("91"))
        firstPage.drawText("/", {
          x: 81,
          y: 147.5,
          size: 16,
          font: customFont,
        });
      // 5. บันทึกเป็นไฟล์ PDF ตัวใหม่
      const pdfBytesSaved = await pdfDoc.save();
      const blob = new Blob([pdfBytesSaved as any], {
        type: "application/pdf",
      });
      saveAs(blob, `ขอใช้รถยนต์ราชการ_${record.id}.pdf`);

      message.success({ content: "ดาวน์โหลด PDF สำเร็จ!", key: "export" });
    } catch (error) {
      console.error("Export PDF error:", error);
      message.error({ content: "เกิดข้อผิดพลาดในการสร้าง PDF", key: "export" });
    }
  };

  return (
    <Tooltip title="พิมพ์ (PDF)">
      <FilePdfOutlined
        style={{
          fontSize: 18,
          color: record.status === "approve" ? "#ff4d4f" : "#d9d9d9",
          cursor: record.status === "approve" ? "pointer" : "not-allowed",
          transition: "color 0.2s",
        }}
        onClick={() => {
          if (record.status === "approve") {
            handleExportPdf();
          }
        }}
        onMouseEnter={(e) => {
          if (record.status === "approve") {
            (e.currentTarget as HTMLElement).style.color = "#cf1322";
          }
        }}
        onMouseLeave={(e) => {
          if (record.status === "approve") {
            (e.currentTarget as HTMLElement).style.color = "#ff4d4f";
          }
        }}
      />
    </Tooltip>
  );
};

export default MaCarPdf;
