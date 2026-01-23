"use client";

import React, { useState } from "react";
import {
  Calendar,
  momentLocalizer,
  Event as RbcEvent,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { OfficialTravelRequestType, UserType } from "../../common";
import moment from "moment";
import "moment/locale/th";

// 🔹 Import Component รายละเอียดที่ทำไว้
import OfficialTravelRequestDetail from "./officialTravelRequestDetail";

// Setup Localizer
const localizer = momentLocalizer(moment);

// --- Custom Interfaces ---
interface CustomEvent extends RbcEvent {
  id: number;
  status: string;
  title: string;
  location: string;
  MasterCar?: {
    licensePlate: string;
    brand: string;
    model: string;
  };
  masterCar: string;
  masterCarObj?: any;
  originalRecord: OfficialTravelRequestType;
}

interface Props {
  data: OfficialTravelRequestType[];
  loading: boolean;
  fetchData: () => void;
  dataUser: UserType[];
}

const OfficialTravelRequestCalendar: React.FC<Props> = ({ data, dataUser }) => {
  const [selected, setSelected] = useState<OfficialTravelRequestType | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  // --- Event Handling ---
  const onSelectEvent = (event: CustomEvent) => {
    const item = data.find((d) => d.id === event.id);
    if (item) {
      setSelected(item);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-2 tracking-tight">
          ปฏิทินการเดินทาง
        </h2>
        {/* เส้น Divider */}
        <hr className="border-slate-100/20 -mx-6 md:-mx-6" />
      </div>

      <div className="modern-calendar-wrapper">
        <Calendar<CustomEvent>
          localizer={localizer}
          events={data.map(
            (item): CustomEvent => ({
              id: item.id,
              title: item.createdName || "ไม่ระบุชื่อ",
              start: new Date(item.startDate),
              end: new Date(item.endDate),
              status: item.status,
              location: `${item.location}`,
              masterCar: item.MasterCar?.licensePlate || "",
              allDay: false,
              originalRecord: item,
            }),
          )}
          style={{ height: 600, fontFamily: "Prompt, sans-serif" }}
          onSelectEvent={onSelectEvent}
          
          // ✅ ปรับช่องวันให้เป็นสีขาวปกติ มีเส้นขอบ
          dayPropGetter={() => ({
            style: {
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0', 
            },
          })}

          eventPropGetter={(event: CustomEvent) => {
            let bgColor = "#eff6ff";
            let textColor = "#1d4ed8";

            if (event.status === "approve") {
              bgColor = "#ffffff"; 
              textColor = "#059669"; 
            } else if (event.status === "cancel") {
              bgColor = "#ffffff"; 
              textColor = "#dc2626"; 
            } else if (event.status === "edit") {
              bgColor = "#ffffff"; 
              textColor = "#ea580c"; 
            }

            return {
              style: {
                backgroundColor: bgColor,
                color: textColor,
                borderLeft: `4px solid ${textColor}`,
                borderTop: '1px solid #e2e8f0',
                borderRight: '1px solid #e2e8f0',
                borderBottom: '1px solid #e2e8f0',
                fontSize: 12,
                borderRadius: "4px",
                fontWeight: 600,
                padding: "2px 6px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                marginBottom: "2px"
              },
            };
          }}
          messages={{
            next: "ถัดไป",
            previous: "ย้อนกลับ",
            today: "วันนี้",
            month: "เดือน",
            week: "สัปดาห์",
            day: "วัน",
            agenda: "กำหนดการ",
            date: "วันที่",
            time: "เวลา",
            event: "ภารกิจ",
            showMore: (total) => `+ อีก ${total} รายการ`,
          }}
        />
      </div>

      <style jsx global>{`
        /* ✅ 1. จัดการสีหัวตาราง (Header Colors) ตามวันไทย */
        /* อาทิตย์ (แดงอ่อน) */
        .rbc-header:nth-child(1) { background-color: #FEF2F2; color: #B91C1C; border-bottom: 2px solid #FECACA; }
        /* จันทร์ (เหลืองอ่อน) */
        .rbc-header:nth-child(2) { background-color: #FEFCE8; color: #A16207; border-bottom: 2px solid #FEF08A; }
        /* อังคาร (ชมพูอ่อน) */
        .rbc-header:nth-child(3) { background-color: #FFF1F2; color: #BE123C; border-bottom: 2px solid #FECDD3; }
        /* พุธ (เขียวอ่อน) */
        .rbc-header:nth-child(4) { background-color: #F0FDF4; color: #15803D; border-bottom: 2px solid #BBF7D0; }
        /* พฤหัส (ส้มอ่อน) */
        .rbc-header:nth-child(5) { background-color: #FFEDD5; color: #C2410C; border-bottom: 2px solid #FED7AA; }
        /* ศุกร์ (ฟ้าอ่อน) */
        .rbc-header:nth-child(6) { background-color: #EFF6FF; color: #1D4ED8; border-bottom: 2px solid #BFDBFE; }
        /* เสาร์ (ม่วงอ่อน) */
        .rbc-header:nth-child(7) { background-color: #FAF5FF; color: #7E22CE; border-bottom: 2px solid #E9D5FF; }

        /* Toolbar Styling */
        .rbc-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 4px;
            position: relative;
            margin-top: -10px; /* ดึงขึ้นไป */
            margin-bottom: 10px;
        }
        
        .rbc-toolbar-label {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            z-index: 0;
        }

        /* Buttons */
        .rbc-btn-group button {
            border: 1px solid #cbd5e1 !important;
            background-color: #fff;
            color: #475569;
            font-family: 'Prompt', sans-serif;
            font-weight: 500;
            padding: 6px 14px;
            font-size: 0.9rem;
            transition: all 0.2s;
            z-index: 1;
        }
        
        .rbc-btn-group > button:first-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
        .rbc-btn-group > button:last-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
        .rbc-btn-group button.rbc-active {
            background-color: #2563eb !important;
            color: #fff !important;
            border-color: #2563eb !important;
        }

        /* Grid */
        .rbc-month-view {
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            overflow: hidden;
            background-color: #fff;
        }

        /* Header Layout */
        .rbc-header {
            padding: 12px 0;
            font-size: 0.95rem;
            font-weight: 700;
            /* สีพื้นหลังกำหนดไว้ด้านบนแยกตามวันแล้ว */
        }
        
        /* Grid Lines */
        .rbc-day-bg { border-left: 1px solid #e2e8f0; }
        .rbc-month-row + .rbc-month-row { border-top: 1px solid #e2e8f0; }
        .rbc-off-range-bg { background-color: #f8fafc !important; }
        
        /* Date Number */
        .rbc-date-cell {
            padding: 6px 8px;
            font-weight: 600;
            color: #64748b;
        }
        
        .rbc-now .rbc-button-link {
            color: #fff;
            background: #2563eb;
            border-radius: 50%;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @media (max-width: 768px) {
            .rbc-toolbar-label {
                position: static;
                transform: none;
                margin: 10px 0;
            }
            .rbc-toolbar {
                flex-direction: column;
                margin-top: 0;
            }
        }
      `}</style>

      <OfficialTravelRequestDetail
        open={modalOpen}
        onClose={handleCloseModal}
        record={selected}
        dataUser={dataUser}
      />
    </>
  );
};

export default OfficialTravelRequestCalendar;