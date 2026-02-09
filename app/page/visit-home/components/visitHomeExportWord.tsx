"use client";

import React, { useEffect, useState } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Tooltip, message } from "antd";
import { FileWordOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import CryptoJS from "crypto-js";
import { userService } from "../../user/services/user.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { UserType } from "../../common";

dayjs.extend(buddhistEra);
dayjs.locale("th");

const SECRET_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "MY_SUPER_SECRET_KEY_1234";

interface VisitHomeExportWordProps {
  record: any;
}

const VisitHomeExportWord: React.FC<VisitHomeExportWordProps> = ({
  record,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthUserService = userService(intraAuth);
  const [userData, setUserData] = useState<UserType[]>([]);

  const fetchData = async () => {
    try {
      const res = await intraAuthUserService.getUserQuery();
      setUserData(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const decryptData = (ciphertext: string | null | undefined) => {
    if (!ciphertext) return "";
    if (typeof ciphertext !== "string") return ciphertext;

    if (!ciphertext.startsWith("U2F") && ciphertext.length < 20) {
      return ciphertext;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText || ciphertext;
    } catch (e) {
      return ciphertext;
    }
  };

  const formatNumber = (input: string | number | undefined | null): string => {
    if (input === null || input === undefined || input === "") return "-";
    return input.toString();
  };

  const formatThaiDate = (date: string | Date | undefined | null) => {
    if (!date) return "....................";
    const d = dayjs(date);
    const day = d.format("D");
    const month = d.format("MMMM");
    const year = d.year() + 543;
    return `${day} ${month} ${year}`;
  };

  const formatDateForFilename = (date: string | Date | undefined | null) => {
    if (!date) return "no-date";
    const d = dayjs(date);
    return d.format("DD-MMM-BB");
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/visitHomeTemplate.docx");
      if (!response.ok) throw new Error("ไม่สามารถโหลดไฟล์ Template ได้");
      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const creator = userData.find((u) => {
        return (
          u.userId === record.createdById ||
          u.userId === record.createdName ||
          `${u.firstName} ${u.lastName}` === record.createdName
        );
      });

      let genderPrefix = "";
      if (creator) {
        if (creator.gender === "male") {
          genderPrefix = "นาย";
        } else if (creator.gender === "female") {
          genderPrefix = "นาง";
        } else if (creator.gender === "miss") {
          genderPrefix = "นางสาว";
        }
      }

      // Decrypt ข้อมูลดิบมาก่อน
      const hhcNo = decryptData(record.hhcNo);
      const fullName = decryptData(record.fullName);
      const address = decryptData(record.address);
      const hn = decryptData(record.hn);
      const cid = decryptData(record.cid);
      const phone = decryptData(record.phone);
      const allergies = decryptData(record.allergies);

      const initialHistoryRaw = decryptData(record.initialHistory);
      const symptomsRaw = decryptData(record.symptoms);
      const diagnosisRaw = decryptData(record.diagnosis);
      const medicalEquipmentRaw = decryptData(record.medicalEquipment);
      const bloodPressure = decryptData(record.bloodPressure);
      const medsRaw = decryptData(record.medication);
      const needsRaw = decryptData(record.careNeeds);

      const data = {
        hhcNo: formatNumber(hhcNo),
        visitDate: formatThaiDate(record.visitDate),
        ptType: record.patientType?.typeName || "-",

        fullName: fullName,
        age: formatNumber(record.age),
        hn: formatNumber(hn),
        dob: formatThaiDate(record.dob),
        cid: formatNumber(cid),
        phone: formatNumber(phone),
        address: address,
        allergies: allergies || "ไม่ระบุ",

        admitDate: formatThaiDate(record.admissionDate),
        dischargeDate: formatThaiDate(record.dischargeDate),

        t: formatNumber(record.temperature),
        pr: formatNumber(record.pulseRate),
        rr: formatNumber(record.respRate),
        bp: formatNumber(bloodPressure),
        o2: formatNumber(record.oxygenSat),

        // ใช้ตัวแปรที่ผ่านการ cleanText แล้ว
        history: initialHistoryRaw || "-",
        symptoms: symptomsRaw || "-",
        diagnosis: diagnosisRaw || "-",
        meds: medsRaw || "-",
        equipment: medicalEquipmentRaw || "-",
        needs: needsRaw || "-",

        nextAppt: formatThaiDate(record.nextAppointment),
        gds: genderPrefix,
        recorder: record.createdName || "....................................",
      };

      console.log("Export Data:", `${data.gds} ${data.recorder}`);

      doc.render(data);

      const blob = doc.getZip().generate({ type: "blob" });
      saveAs(
        blob,
        `${fullName || "unknown"}_${formatDateForFilename(record.visitDate)}.docx`,
      );
      message.success("ดาวน์โหลดไฟล์เรียบร้อยแล้ว");
    } catch (error) {
      console.error("Export error:", error);
      message.error("เกิดข้อผิดพลาดในการสร้างไฟล์ Word");
    }
  };

  return (
    <Tooltip title="พิมพ์ใบเยี่ยมบ้าน (Word)">
      <FileWordOutlined
        style={{
          fontSize: 18,
          color: "#1677ff",
          cursor: "pointer",
        }}
        onClick={handleExport}
      />
    </Tooltip>
  );
};

export default VisitHomeExportWord;
