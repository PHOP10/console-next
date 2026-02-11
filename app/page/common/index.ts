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
  phoneNumber?: string;
  employeeId?: string;
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
  recipient?: string;
  privateCarId?: number;
  otherTravelType?: string;
  travelType: string[];
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
  returnAt: string;
  returnNote: string;
  returnByName: string;
  startMileage?: number;
  returnMileage?: number;
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
  mileage?: number;
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
  hhcNo?: string;
  referralDate?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  hn: string;
  dob?: string;
  cid?: string;
  phone?: string;
  address: string;
  allergies?: string;
  admissionDate?: string;
  dischargeDate?: string;
  temperature?: number;
  pulseRate?: number;
  respRate?: number;
  bloodPressure?: string;
  oxygenSat?: number;
  initialHistory?: string;
  symptoms?: string;
  diagnosis?: string;
  medication?: string;
  medicalEquipment?: string;
  careNeeds?: string;
  visitDate: string;
  nextAppointment?: string;
  notes?: string;
  createdName?: string;
  createdAt: string;
  updatedAt: string;
  patientTypeId?: number;
  patientType?: MasterPatientType;
}

export interface MasterPatientType {
  id: number;
  typeName: string;
  description?: string;
  VisitHome: VisitHomeType;
}

// 1. MaDrug (ใบเบิกยา - ขาเข้า)
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
  quantityUsed?: number;
  totalPrice?: number;
  createdName: string;

  // ความสัมพันธ์
  maDrugItems?: MaDrugItemType[];
}

// 2. Drug (ข้อมูลยา Master)
export interface DrugType {
  id: number;
  workingCode: string;
  name: string;
  drugTypeId: number;
  packagingSize: string;
  price: number;
  quantity: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  drugType?: MasterDrugType;
  maDrugItems?: MaDrugItemType[];
  dispenseItems?: DispenseItemType[];
  expiryDate?: string | null;
  drugLots?: DrugLotType[];
}

// 3. MasterDrug (ประเภทยา)
export interface MasterDrugType {
  id: number;
  drugTypeId: number;
  drugType: string;
  description?: string;

  // ความสัมพันธ์
  drugs?: DrugType[];
}

// 4. MaDrugItem (รายการยาในใบเบิก - ขาเข้า)
export interface MaDrugItemType {
  id: number;
  maDrugId: number;
  drugId: number;
  quantity: number;
  cancelReason?: string;
  price?: number;

  // ✅ [NEW] วันหมดอายุ (รับค่าจากหน้าจอ)
  expiryDate?: string | null;

  // ความสัมพันธ์
  maDrug?: MaDrugType;
  drug?: DrugType;

  // ✅ [NEW] เชื่อมโยงกับ Lot ที่ถูกสร้างขึ้น
  drugLot?: DrugLotType;
}

// ✅ 5. Dispense (ใบจ่ายยา - ขาออก)
export interface DispenseType {
  id: number;
  dispenseDate: string; // ISO Date String
  dispenserName?: string;
  receiverName?: string;
  note?: string;
  totalPrice?: number;
  status: string; // pending, approved, completed, canceled
  createdAt: string;
  updatedAt: string;

  // ความสัมพันธ์
  dispenseItems?: DispenseItemType[];
}

// ✅ 6. DispenseItem (รายการยาในใบจ่าย - ขาออก)
export interface DispenseItemType {
  id: number;
  dispenseId: number;
  drugId: number;
  quantity: number;
  price?: number;

  // ความสัมพันธ์
  dispense?: DispenseType;
  drug?: DrugType;
}

// ✅ 7. DrugLot (สต็อกย่อย/ล็อตยา) [NEW TYPE]
export interface DrugLotType {
  id: number;
  drugId: number;
  lotNumber?: string;
  price: number; // ต้นทุนของล็อตนี้
  quantity: number; // คงเหลือในล็อตนี้
  isActive: boolean;
  createdAt: string;
  expiryDate?: dayjs.Dayjs | null;
  // ความสัมพันธ์
  drug?: DrugType;
  maDrugItem?: MaDrugItemType;
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
