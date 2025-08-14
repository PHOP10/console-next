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
  approveStatus: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
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
  masterCarId: number;
  createdAt: string;
  updatedAt: string;
}

export interface MasterCarType {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  seatCount: number;
  fuelType: string;
  status: string;
  details?: string;
}

export interface DataLeaveType {
  id: number;
  reason: string;
  leaveDateStart: string;
  leaveDateEnd: string;
  approveStatus: string;
  approvedBy?: string;
  details?: string;
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
}

export interface MasterPatientType {
  id: number;
  typeName: string;
  description?: string;
}

export interface MaDrugType {
  id: number;
  MaDrugId: number;
  requestNumber: string;
  requestUnit: string;
  roundNumber: number;
  requesterName: string;
  dispenserName: string;
  requestDate: string;
  quantityUsed: number;
  note?: string;
  status: string;
  drugId: number;
  createdAt: string;
  updatedAt: string;
}

export interface DrugType {
  id: number;
  DrugId: number;
  workingCode: string;
  name: string;
  drugTypeId: number;
  packagingSize: string;
  price: number;
  quantity: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MasterDrugType {
  id: number;
  drugTypeId: number;
  drugType: string;
  description?: string;
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
