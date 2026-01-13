import dayjs from "dayjs";

export interface UserType {
  id: number;
  userId: string;
  username: string;
  nickName: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  refreshToken?: string | null;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  fullName?: string;
  position?: string;
  startDate?: string;
  gender?: string;
}

export interface OfficialTravelRequestType {
  id: number;
  documentNo: string;
  title: string;
  missionDetail: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  cancelReason?: string;
  carId?: number;
  MasterCar?: MasterCarType | null;
  createdById?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  passengers?: number;
  passengerNames?: string;
  cancelName?: string;
  cancelAt?: string;
  createdName: string;
  note?: string;
  budget?: number;
}

export interface MaCarType {
  id: number;
  requesterName: string;
  purpose: string;
  dateStart: string;
  dateEnd: string;
  destination: string;
  passengers: number;
  passengerNames?: string[];
  budget?: number;
  status: string;
  cancelName?: string;
  cancelReason?: string;
  cancelAt?: string;
  approvedByName?: string;
  approvedAt?: string;
  carId: number; // FK
  masterCar?: MasterCarType;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  createdName: string;
  driver?: string;
  note?: string;
}

export interface MasterCarType {
  id: number;
  carName: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  status: string;
  details?: string;
  maCars?: MaCarType[];
  carId?: string;
  numberType?: number;
  fuelType?: string;
}

export interface DataLeaveType {
  id: number;
  reason: string;
  dateStart: string;
  dateEnd: string;
  status: string;
  approvedById?: string;
  approvedByName?: string;
  approvedDate?: string;
  approvedAt?: string;
  cancelReason?: string;
  cancelName?: string;
  createdName: string;
  createdById?: string;
  cancelAt?: string;
  details?: string;
  typeId: number;
  masterLeave: MasterLeaveType;
  createdAt: string;
  updatedAt: string;
  fileName?: string;
  writeAt?: string;
  contactAddress?: string;
  contactPhone?: string;
  backupUserId?: string;
  backupUserName?: string;
}

export interface MasterLeaveType {
  id: number;
  leaveType: string;
  description?: string;
}
export interface VisitHomeType {
  id: number;
  // --- 1. ข้อมูลทั่วไปและระบุตัวตน (Identity) ---
  hhcNo?: string; // เลขที่ HHC
  referralDate?: string; // วันที่ส่งต่อ (ISO String)
  firstName: string; // ชื่อจริง
  lastName: string; // นามสกุล
  fullName: string; // ชื่อ-นามสกุล
  age: number; // อายุ
  hn: string; // HN
  dob?: string; // วันเดือนปีเกิด (ISO String)
  cid?: string; // เลขบัตรประชาชน 13 หลัก
  phone?: string; // เบอร์โทรศัพท์
  address: string; // ที่อยู่
  allergies?: string; // ประวัติแพ้ยา/อาหาร
  // --- 2. ข้อมูลการรักษา (Admission) ---
  admissionDate?: string; // วันที่แอดมิท (ISO String)
  dischargeDate?: string; // วันที่จำหน่าย (ISO String)
  // --- 3. สัญญาณชีพ (Vital Signs) ---
  temperature?: number; // อุณหภูมิ (T)
  pulseRate?: number; // ชีพจร (PR)
  respRate?: number; // อัตราการหายใจ (RR)
  bloodPressure?: string; // ความดันโลหิต (BP) เช่น "120/80"
  oxygenSat?: number; // ออกซิเจนในเลือด (O2 Sat)
  // --- 4. อาการและการวินิจฉัย (Clinical Data) ---
  initialHistory?: string; // ประวัติเจ็บป่วยแรกรับ
  symptoms?: string; // อาการปัจจุบัน
  diagnosis?: string; // การวินิจฉัยโรค
  // --- 5. การดูแลและอุปกรณ์ (Care & Equipment) ---
  medication?: string; // ยาที่ได้รับ/ใช้
  medicalEquipment?: string; // อุปกรณ์ติดตัวกลับบ้าน
  careNeeds?: string; // ความต้องการดูแล / ปัญหาที่พบ
  // --- 6. การนัดหมาย (Appointment) ---
  visitDate: string; // วันที่เยี่ยมบ้าน (ISO String)
  nextAppointment?: string; // วันนัดครั้งถัดไป (ISO String)
  notes?: string; // หมายเหตุ
  // --- 7. ข้อมูลระบบ (System & Relations) ---
  createdName?: string; // ชื่อผู้บันทึก
  createdAt: string;
  updatedAt: string;
  patientTypeId?: number; // FK ID ประเภทผู้ป่วย
  patientType?: MasterPatientType; // Relation Object (ถ้ามีการ Join)
}

export interface MasterPatientType {
  id: number;
  typeName: string;
  description?: string;
  VisitHome: VisitHomeType;
}

// รายการเบิกยา
export interface MaDrugType {
  id: number;
  requestNumber: string;
  requestUnit: string;
  roundNumber: number;
  requesterName: string;
  dispenserName: string;
  requestDate: string; // ISO Date String
  note?: string;
  cancelReason?: string;
  status: string;
  createdAt: string;
  updatedAt: string;

  // ความสัมพันธ์
  maDrugItems?: MaDrugItemType[];
}

// ข้อมูลยา
export interface DrugType {
  id: number;
  workingCode: string;
  name: string;
  drugTypeId: number; // FK ไป MasterDrug
  packagingSize: string;
  price: number;
  quantity: number;
  note?: string;
  createdAt: string;
  updatedAt: string;

  // ความสัมพันธ์
  drugType?: MasterDrugType;
  maDrugItems?: MaDrugItemType[];
}

// ประเภทยา
export interface MasterDrugType {
  id: number;
  drugTypeId: number;
  drugType: string;
  description?: string;

  // ความสัมพันธ์
  drugs?: DrugType[];
}

// รายการยาในแต่ละการเบิก
export interface MaDrugItemType {
  id: number;
  maDrugId: number;
  drugId: number;
  quantity: number;
  cancelReason?: string;

  // ความสัมพันธ์
  maDrug?: MaDrugType;
  drug?: DrugType;
}

export interface DurableArticleType {
  id: number;
  code: string;
  acquiredDate: string;
  description: string;
  unitPrice: number;
  acquisitionType: string;
  usageLifespanYears: number;
  monthlyDepreciation: number;
  yearlyDepreciation: number;
  accumulatedDepreciation: number;
  netValue: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportingResourceType {
  id: number;
  code: string;
  name: string;
  status: string;
  acquiredDate: string;
  acquisitionType: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface MedicalEquipmentType {
  id: number;
  equipmentName: string;
  quantity: number;
  acquiredDate?: string;
  createdBy?: string;
  createdById?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: MaMedicalEquipmentItemType[];
}

export interface MaMedicalEquipmentType {
  id: number;
  sentDate: string;
  receivedDate?: string;
  status: string;
  note?: string;
  cancelReason?: string;
  nameReason?: string;
  createdBy?: string;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
  approveById?: string;
  approveBy?: string;
  approveAt?: string;
  items?: MaMedicalEquipmentItemType[];
}

export interface MaMedicalEquipmentItemType {
  id: number;
  quantity: number;
  maMedicalEquipmentId: number;
  medicalEquipmentId: number;
  medicalEquipment?: MedicalEquipmentType;
}

export interface InfectiousWasteType {
  id: number;
  wasteType: string;
  wasteWeight: number;
  discardedDate: string;
  wasteDate?: string;
  createdAt: string;
  updatedAt: string;
}
