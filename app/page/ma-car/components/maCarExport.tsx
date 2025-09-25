"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Button } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../../user/services/user.service";
import { useEffect, useState } from "react";
import { UserType } from "../../common";

dayjs.locale("th");

interface MaCarExportWordProps {
  record: any;
}

const MaCarExportWord: React.FC<MaCarExportWordProps> = ({ record }) => {
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

  const toThaiNumber = (input: string | number): string => {
    const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
    return input
      .toString()
      .replace(/[0-9]/g, (digit) => thaiDigits[parseInt(digit)]);
  };

  const formatThaiDate = (date: string | Date) => {
    const d = dayjs(date);
    const day = toThaiNumber(d.format("D"));
    const month = d.format("MMMM");
    const year = toThaiNumber(d.year() + 543);
    return `${day} ${month} ${year}`;
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/maCarTemplate.docx");
      if (!response.ok) throw new Error("ไม่สามารถโหลด maCarTemplate.docx");
      const arrayBuffer = await response.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      console.log("record.passengerNames:", record.passengerNames);
      console.log("userData:", userData);

      if (userData.length === 0) {
        // โหลด userData ก่อนถ้ายังว่าง
        try {
          const res = await intraAuthService.getUserQuery();
          setUserData(res);
        } catch (err) {
          console.error(err);
          return;
        }
      }

      // 🔍 แมป id → ชื่อจริง
      const passengerList = Array.isArray(record.passengerNames)
        ? record.passengerNames.map((userId: string, i: number) => {
            const user = userData.find((u) => u.userId === userId);
            const fullName = user
              ? `${user.firstName} ${user.lastName}`
              : "(ไม่พบชื่อ)";
            const position = user?.position ?? "-";
            return {
              index: toThaiNumber(i + 1),
              name: fullName,
              position: position,
            };
          })
        : [];

      // ✅ เตรียมข้อมูลส่งเข้า template
      const data = {
        id: toThaiNumber(record.id ?? "-"),
        requesterName: record.requesterName ?? "-",
        purpose: record.purpose ?? "-",
        destination: record.destination ?? "-",
        passengers: toThaiNumber(record.passengers ?? "-"),
        passengerss: passengerList,
        passengerNames: passengerList.join("\n"), // 👉 ให้ขึ้นบรรทัดใหม่
        budget: record.budget
          ? toThaiNumber(
              record.budget.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })
            )
          : "-",
        status: record.status ?? "-",

        dateStart: record.dateStart ? formatThaiDate(record.dateStart) : "-",
        dateEnd: record.dateEnd ? formatThaiDate(record.dateEnd) : "-",
        createdAt: record.createdAt ? formatThaiDate(record.createdAt) : "-",
        updatedAt: record.updatedAt ? formatThaiDate(record.updatedAt) : "-",
        D: record.createdAt
          ? toThaiNumber(dayjs(record.createdAt).format("D"))
          : "-",
        MM: record.createdAt ? dayjs(record.createdAt).format("MMMM") : "-",
        BBBB: record.createdAt
          ? toThaiNumber(dayjs(record.createdAt).year() + 543)
          : "-",

        cancelName: record.cancelName ?? "-",
        cancelReason: record.cancelReason ?? "-",
        cancelAt: record.cancelAt
          ? toThaiNumber(dayjs(record.cancelAt).format("D MMMM BBBB HH:mm"))
          : "-",
        approvedByName: record.approvedByName ?? "-",
        approvedAt: record.approvedAt
          ? toThaiNumber(dayjs(record.approvedAt).format("D MMMM BBBB HH:mm"))
          : "-",

        carName: record.masterCar?.carName ?? "-",
        licensePlate: toThaiNumber(record.masterCar?.licensePlate ?? "-"),
        brand: record.masterCar?.brand ?? "-",
        model: record.masterCar?.model ?? "-",
        year: toThaiNumber(record.masterCar?.year ?? "-"),
        carDetails: record.masterCar?.details ?? "-",
      };

      doc.render(data);

      const blob = doc.getZip().generate({ type: "blob" });
      saveAs(blob, `การใช้รถ_${record.id}.docx`);
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

export default MaCarExportWord;
