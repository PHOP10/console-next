export interface UserType {
  id: number;
  username: string;
  password: string;
  name: string;
  age: number;
  email: string;
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
  carId?: number;
  MasterCar?: MasterCarType | null;
  createdById?: number;
  approvedById?: string;
  approvedByName?: string;
  approvedDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface MaCarType {
  id: number;
  requesterName: string;
  purpose: string;
  departureDate: string;
  returnDate: string;
  destination: string;
  passengers: number;
  budget?: number;
  status: string;
  carId: number; // FK
  masterCar?: MasterCarType;
  createdAt: string;
  updatedAt: string;
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
  details?: string;
  typeId: number;
  masterLeave: MasterLeaveType;
  createdAt: string;
  updatedAt: string;
}
export interface MasterLeaveType {
  id: number;
  leaveType: string;
  description?: string;
}
export interface VisitHomeType {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  address: string;
  visitDate: string;
  symptoms?: string;
  medication?: string;
  nextAppointment?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  patientTypeId: number;
  patientType: MasterPatientType;
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
  updatedAt: string;
}

export interface MedicalEquipmentType {
  id: number;
  code: string;
  name: string;
  quantity: number;
  acquiredDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaMedicalEquipmentType {
  equipmentInfo: any;
  id: number;
  quantity: number;
  sentDate: string;
  receivedDate?: string;
  status: string;
  note?: string;
  equipmentId: number;
  createdAt: string;
  updatedAt: string;
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
