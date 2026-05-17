export type PermitType = 
  | 'BUILDING_SIGN' 
  | 'FENCING' 
  | 'DEMOLITION' 
  | 'EXCAVATION' 
  | 'ELECTRICAL';

export type ApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'NEEDS_REVISION';

export interface PermitApplication {
  id: string;
  applicantId: string;
  type: PermitType;
  status: ApplicationStatus;
  submissionDate: number;
  data: Record<string, any>;
  appointmentDate?: number;
}

export type ProjectCategory = 'NATIONAL' | 'CAPITOL' | 'MUNICIPAL' | 'BARANGAY';
export type ProjectStatus = 'PLANNING' | 'ONGOING' | 'COMPLETED';

export interface Project {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  status: ProjectStatus;
  category: ProjectCategory;
  budget: number;
  description: string;
  completionPhotoUrl?: string;
  completionNotes?: string;
  completionDate?: number;
  actualTotalCost?: number;
}

export type IssueCategory = 
  | 'INSPECTION_REQUEST'
  | 'ILLEGAL_CONSTRUCTION'
  | 'ELECTRICAL_HAZARD'
  | 'ROADWAY_HAZARD'
  | 'WATERLINE_HAZARD';

export interface UserProfile {
  uid: string;
  username?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  contactNumber: string;
  permanentAddress: string;
  jalajalaAddress: string;
  birthdate: string;
  gender: 'MALE' | 'FEMALE' | 'THIRD_SEX';
  genderSpecify?: string;
  classification: 'CITIZEN' | 'BUSINESS_OWNER' | 'GOVERNMENT' | 'PWD' | 'SENIOR_CITIZEN';
  govSpecify?: string;
  idNumber: string;
  idPhotoUrl: string;
  updatedAt: number;
}

export interface IssueReport {
  id: string;
  category: IssueCategory;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  timestamp: number;
  status: 'NEW' | 'INVESTIGATING' | 'RESOLVED';
  userId?: string;
  reporterName?: string;
  idPhotoUrl?: string;
}
