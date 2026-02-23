import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// --- Interfaces ---

export interface Patient {
  patient_id: number;
  user_id?: number | null;
  national_number: string;
  first_name: string;
  surname: string;
  father_name?: string | null;
  mother_name?: string | null;
  gender?: string | null;
  dob?: string | null;
  phone_number?: string | null;
  address?: string | null;
}

export interface Visit {
  visit_id: number;
  patient_id: number;
  visit_time: string;
}

export interface PrimaryMedicalInfo {
  pmd_id: number;
  visit_id: number;
  user_id: number;
  bp?: string | null;
  spo2?: number | null;
  glucose?: number | null;
  temperature?: number | null;
  weight?: number | null;
  pulse?: number | null;
}

export interface ClinicalNote {
  clinical_notes_id: number;
  visit_id: number;
  user_id: number;
  note_time?: string | null;
  visit_reason?: string | null;
  medical_history?: string | null;
  medications?: string | null;
  exam_notes?: string | null;
  diagnosis?: string | null;
  prescription?: string | null;
  referrals?: string | null;
}

export interface TestResult {
  test_id: number;
  visit_id: number;
  test_type: string;
  test_time?: string | null;
  test_result?: string | null;
  test_attachment?: string | null;
}

// --- Service ---

@Injectable({ providedIn: 'root' })
export class PatientsApi {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Patients
  list()                { return this.http.get<Patient[]>(`${this.base}/patients`); }
  get(id: number)       { return this.http.get<Patient>(`${this.base}/patients/${id}`); }
  create(data: Partial<Patient>) { return this.http.post<Patient>(`${this.base}/patients`, data); }
  update(id: number, data: Partial<Patient>) { return this.http.put<Patient>(`${this.base}/patients/${id}`, data); }
  delete(id: number)    { return this.http.delete(`${this.base}/patients/${id}`); }

  // Visits
  visits(patientId: number)   { return this.http.get<Visit[]>(`${this.base}/patients/${patientId}/visits`); }
  createVisit(data: { patient_id: number; visit_time?: string }) {
    return this.http.post<Visit>(`${this.base}/visits`, data);
  }

  // Primary Medical Info (Vitals)
  getVitals(visitId: number) { return this.http.get<PrimaryMedicalInfo>(`${this.base}/visits/${visitId}/primary-medical-info`); }
  saveVitals(visitId: number, data: Partial<PrimaryMedicalInfo>) {
    return this.http.post<PrimaryMedicalInfo>(`${this.base}/visits/${visitId}/primary-medical-info`, data);
  }

  // Clinical Notes
  getNotes(visitId: number) { return this.http.get<ClinicalNote[]>(`${this.base}/visits/${visitId}/clinical-notes`); }
  saveNote(visitId: number, data: Partial<ClinicalNote>) {
    return this.http.post<ClinicalNote>(`${this.base}/visits/${visitId}/clinical-notes`, data);
  }

  // Test Results
  getTests(visitId: number) { return this.http.get<TestResult[]>(`${this.base}/visits/${visitId}/tests`); }
  saveTest(visitId: number, data: Partial<TestResult>) {
    return this.http.post<TestResult>(`${this.base}/visits/${visitId}/tests`, data);
  }
}
