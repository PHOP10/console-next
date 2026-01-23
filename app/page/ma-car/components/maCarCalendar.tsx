"use client";

import React, { useState } from "react";
import {
  Calendar,
  momentLocalizer,
  Event as RbcEvent,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { MaCarType, MasterCarType, UserType } from "../../common";
import moment from "moment";
import "moment/locale/th";
import MaCarDetail from "./maCarDetail";

const localizer = momentLocalizer(moment);

interface CustomEvent extends RbcEvent {
  id: number;
  status: string;
  title: string;
  location: string;
  masterCar: string;
  passengers: number;
  budget?: number;
  originalRecord: MaCarType;
}

interface Props {
  data: MaCarType[];
  loading: boolean;
  fetchData: () => void;
  cars: MasterCarType[];
  dataUser: UserType[];
}

const MaCarCalendar: React.FC<Props> = ({ data, cars, dataUser }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  // Helper Function
  const getUserName = (idOrName: string) => {
    if (!idOrName) return "-";
    const user = dataUser.find((u) => u.userId === idOrName);
    return user ? `${user.firstName} ${user.lastName}` : idOrName;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approve":
        return "#10b981";
      case "cancel":
        return "#ef4444";
      case "pending":
        return "#3b82f6";
      case "edit":
        return "#f97316";
      default:
        return "#3b82f6";
    }
  };

  // ✅ แก้ไขตรงนี้: รับแค่ event และ setSelected แค่ item
  const onSelectEvent = (event: CustomEvent) => {
    const item = data.find((d) => d.id === event.id);
    if (item) {
      setSelectedRecord({ ...item, dataUser });

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
          ปฏิทินการจองรถ
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
              title: getUserName(item.createdName),
              start: new Date(item.dateStart),
              end: new Date(item.dateEnd),
              status: item.status,
              location: item.destination,
              masterCar: `ID: ${item.carId}`,
              passengers: item.passengers,
              budget: item.budget,
              originalRecord: item,
            }),
          )}
          style={{ height: 600, fontFamily: "Prompt, sans-serif" }}
          onSelectEvent={onSelectEvent}
          
          // ✅ พื้นหลังวันสีขาว
          dayPropGetter={() => ({
            style: {
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0', 
            },
          })}

          // ✅ ปรับสี Event ให้ตรงกับปฏิทินเดินทาง (Pending = สีฟ้า)
          eventPropGetter={(event: CustomEvent) => {
            // 🔹 ตั้งค่าเริ่มต้นเป็น "สีฟ้า" (สำหรับ pending หรือสถานะอื่นๆ)
            let bgColor = "#eff6ff"; 
            let textColor = "#1d4ed8";

            // 🔹 เปลี่ยนสีเฉพาะสถานะที่กำหนด
            if (event.status === "approve" || event.status === "completed") {
              bgColor = "#ffffff"; 
              textColor = "#059669"; // เขียว
            } else if (event.status === "cancel" || event.status === "reject") {
              bgColor = "#ffffff"; 
              textColor = "#dc2626"; // แดง
            } 
            // ❌ เอาเงื่อนไข pending สีส้มออก เพื่อให้ตกไปใช้สีฟ้าด้านบน

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
            event: "การจอง",
            showMore: (total) => `+ อีก ${total} รายการ`,
          }}
        />
      </div>

      {/* CSS Override (ชุดเดิม) */}
      <style jsx global>{`
        /* Header Colors */
        .rbc-header:nth-child(1) { background-color: #FEF2F2; color: #B91C1C; border-bottom: 2px solid #FECACA; }
        .rbc-header:nth-child(2) { background-color: #FEFCE8; color: #A16207; border-bottom: 2px solid #FEF08A; }
        .rbc-header:nth-child(3) { background-color: #FFF1F2; color: #BE123C; border-bottom: 2px solid #FECDD3; }
        .rbc-header:nth-child(4) { background-color: #F0FDF4; color: #15803D; border-bottom: 2px solid #BBF7D0; }
        .rbc-header:nth-child(5) { background-color: #FFEDD5; color: #C2410C; border-bottom: 2px solid #FED7AA; }
        .rbc-header:nth-child(6) { background-color: #EFF6FF; color: #1D4ED8; border-bottom: 2px solid #BFDBFE; }
        .rbc-header:nth-child(7) { background-color: #FAF5FF; color: #7E22CE; border-bottom: 2px solid #E9D5FF; }

        /* Toolbar */
        .rbc-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 4px;
            position: relative;
            margin-top: -10px;
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
        .rbc-header {
            padding: 12px 0;
            font-size: 0.95rem;
            font-weight: 700;
        }
        .rbc-day-bg { border-left: 1px solid #e2e8f0; }
        .rbc-month-row + .rbc-month-row { border-top: 1px solid #e2e8f0; }
        .rbc-off-range-bg { background-color: #f8fafc !important; }
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

      <MaCarDetail
        open={modalOpen}
        onClose={handleCloseModal}
        record={selectedRecord}
        dataUser={dataUser}
      />
    </>
  );
};

export default MaCarCalendar;
