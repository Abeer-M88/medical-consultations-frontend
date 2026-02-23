import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsApi, Patient, Visit } from '../../core/api/patients.api';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:24px;">
      <!-- Back button -->
      <button (click)="goBack()" style="margin-bottom:16px; padding:6px 14px; background:transparent; border:1px solid #999; border-radius:4px; cursor:pointer;">
        &larr; Back to Patients
      </button>

      <p *ngIf="loading">Loading...</p>
      <p *ngIf="error" style="color:#b00020;">{{ error }}</p>

      <!-- Patient Info Card -->
      <div *ngIf="patient" style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); margin-bottom:24px;">
        <h2 style="margin-top:0; color:#1a237e;">{{ patient.first_name }} {{ patient.father_name || '' }} {{ patient.surname }}</h2>
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

      <!-- Admin cannot see visits / medical info -->
      <div *ngIf="role === 'admin' && patient" style="background:#fff3e0; padding:16px; border-radius:8px; border:1px solid #ffe0b2; color:#e65100; font-size:14px;">
        As an administrator, you can only view patient personal information. Medical records are accessible to medical staff only.
      </div>

      <!-- Visits Section - only for nurse, doctor, patient -->
      <div *ngIf="patient && role !== 'admin'">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="margin:0;">Visits</h3>
          <button *ngIf="role === 'nurse' || role === 'doctor'"
                  (click)="createVisit()"
                  style="padding:8px 16px; background:#1a237e; color:#fff; border:none; border-radius:4px; cursor:pointer;">
            + New Visit
          </button>
        </div>

        <p *ngIf="visitsLoading">Loading visits...</p>

        <div *ngIf="visits.length > 0" style="background:#fff; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); overflow:hidden;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#e8eaf6; text-align:left;">
                <th style="padding:12px;">Visit #</th>
                <th style="padding:12px;">Date & Time</th>
                <th style="padding:12px;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let v of visits; let i = index" style="border-bottom:1px solid #eee;">
                <td style="padding:10px 12px;">{{ v.visit_id }}</td>
                <td style="padding:10px 12px;">{{ v.visit_time }}</td>
                <td style="padding:10px 12px;">
                  <button (click)="openVisit(v.visit_id)"
                          style="padding:6px 12px; background:#1a237e; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:13px;">
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p *ngIf="!visitsLoading && visits.length === 0" style="color:#666;">No visits recorded yet.</p>
      </div>
    </div>
  `,
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  visits: Visit[] = [];
  loading = true;
  visitsLoading = true;
  error: string | null = null;
  role: string | null = null;
  private patientId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: PatientsApi,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.role = this.auth.getRole();
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPatient();
    if (this.role !== 'admin') {
      this.loadVisits();
    } else {
      this.visitsLoading = false;
    }
  }

  loadPatient() {
    this.api.get(this.patientId).subscribe({
      next: (p) => { this.patient = p; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load patient.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  loadVisits() {
    this.api.visits(this.patientId).subscribe({
      next: (v) => { this.visits = v; this.visitsLoading = false; this.cdr.detectChanges(); },
      error: () => { this.visitsLoading = false; this.cdr.detectChanges(); },
    });
  }

  createVisit() {
    this.api.createVisit({ patient_id: this.patientId }).subscribe({
      next: (v) => {
        this.router.navigate(['/patients', this.patientId, 'visits', v.visit_id]);
      },
      error: () => { alert('Failed to create visit.'); },
    });
  }

  openVisit(visitId: number) {
    this.router.navigate(['/patients', this.patientId, 'visits', visitId]);
  }

  goBack() {
    this.router.navigate(['/patients']);
  }
}
