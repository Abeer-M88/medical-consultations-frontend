import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PatientsApi, Patient, Visit } from '../../core/api/patients.api';
import { AuthService } from '../../core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:24px;">
      <h2>My Medical Record</h2>

      <p *ngIf="loading">Loading your record...</p>
      <p *ngIf="error" style="color:#b00020;">{{ error }}</p>

      <!-- Patient Info -->
      <div *ngIf="patient" style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); margin-bottom:24px;">
        <h3 style="margin-top:0; color:#1a237e;">Personal Information</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; font-size:14px;">
          <div><strong>National No.:</strong><br>{{ patient.national_number || 'N/A' }}</div>
          <div><strong>First Name:</strong><br>{{ patient.first_name || 'N/A' }}</div>
          <div><strong>Surname:</strong><br>{{ patient.surname || 'N/A' }}</div>
          <div><strong>Father Name:</strong><br>{{ patient.father_name || 'N/A' }}</div>
          <div><strong>Mother Name:</strong><br>{{ patient.mother_name || 'N/A' }}</div>
          <div><strong>Gender:</strong><br>{{ patient.gender || 'N/A' }}</div>
          <div><strong>Date of Birth:</strong><br>{{ patient.dob || 'N/A' }}</div>
          <div><strong>Phone:</strong><br>{{ patient.phone_number || 'N/A' }}</div>
          <div><strong>Address:</strong><br>{{ patient.address || 'N/A' }}</div>
        </div>
      </div>

      <!-- Visits -->
      <div *ngIf="patient">
        <h3>My Visits</h3>
        <div *ngFor="let v of visits" style="background:#fff; padding:16px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>Visit #{{ v.visit_id }}</strong>
              <span style="margin-left:12px; color:#666; font-size:13px;">{{ v.visit_time }}</span>
            </div>
            <button (click)="viewVisit(v.visit_id)"
                    style="padding:6px 12px; background:#1a237e; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:13px;">
              View Details
            </button>
          </div>
        </div>
        <p *ngIf="visits.length === 0" style="color:#666;">No visits recorded yet.</p>
      </div>
    </div>
  `,
})
export class MyRecordComponent implements OnInit {
  patient: Patient | null = null;
  visits: Visit[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private api: PatientsApi,
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userId = this.auth.getUser()?.user_id;
    if (!userId) {
      this.error = 'User not found.';
      this.loading = false;
      return;
    }

    this.api.list().subscribe({
      next: (patients) => {
        this.patient = patients.find(p => p.user_id === userId) || null;
        this.loading = false;
        if (this.patient) {
          this.loadVisits(this.patient.patient_id);
        } else {
          this.error = 'No patient record linked to your account.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load your record.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadVisits(patientId: number) {
    this.api.visits(patientId).subscribe({
      next: (v) => { this.visits = v; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  viewVisit(visitId: number) {
    if (this.patient) {
      this.router.navigate(['/patients', this.patient.patient_id, 'visits', visitId]);
    }
  }
}
