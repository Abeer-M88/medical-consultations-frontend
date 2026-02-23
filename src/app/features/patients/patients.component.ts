import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientsApi, Patient } from '../../core/api/patients.api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="margin:0;">Patients</h2>
        <button (click)="showForm = !showForm"
                style="padding:8px 16px; background:#1a237e; color:#fff; border:none; border-radius:4px; cursor:pointer;">
          {{ showForm ? 'Cancel' : '+ Add Patient' }}
        </button>
      </div>

      <!-- Add Patient Form -->
      <div *ngIf="showForm" style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); margin-bottom:20px;">
        <h3 style="margin-top:0;">New Patient</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label style="font-size:13px; font-weight:bold;">National Number *</label>
            <input [(ngModel)]="newPatient.national_number" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
          <div>
            <label style="font-size:13px; font-weight:bold;">First Name *</label>
            <input [(ngModel)]="newPatient.first_name" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
          <div>
            <label style="font-size:13px; font-weight:bold;">Surname *</label>
            <input [(ngModel)]="newPatient.surname" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
          <div>
            <label style="font-size:13px; font-weight:bold;">Father Name</label>
            <input [(ngModel)]="newPatient.father_name" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
          <div>
            <label style="font-size:13px; font-weight:bold;">Mother Name</label>
            <input [(ngModel)]="newPatient.mother_name" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
          <div>
            <label style="font-size:13px; font-weight:bold;">Gender *</label>
            <select [(ngModel)]="newPatient.gender" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label style="font-size:13px; font-weight:bold;">Date of Birth</label>
            <input type="date" [(ngModel)]="newPatient.dob" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
          <div>
            <label style="font-size:13px; font-weight:bold;">Phone</label>
            <input [(ngModel)]="newPatient.phone_number" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
          <div style="grid-column: span 2;">
            <label style="font-size:13px; font-weight:bold;">Address</label>
            <input [(ngModel)]="newPatient.address" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
        </div>
        <div style="margin-top:16px;">
          <button (click)="addPatient()"
                  style="padding:8px 20px; background:#2e7d32; color:#fff; border:none; border-radius:4px; cursor:pointer; margin-right:8px;">
            Save
          </button>
          <span *ngIf="formError" style="color:#b00020; font-size:13px;">{{ formError }}</span>
          <span *ngIf="formSuccess" style="color:#2e7d32; font-size:13px;">{{ formSuccess }}</span>
        </div>
      </div>

      <!-- Search -->
      <div style="margin-bottom:16px;">
        <input [(ngModel)]="searchTerm" placeholder="Search by name or national number..."
               style="padding:8px 12px; width:300px; border:1px solid #ccc; border-radius:4px;" />
      </div>

      <p *ngIf="loading">Loading patients...</p>
      <p *ngIf="error" style="color:#b00020;">{{ error }}</p>

      <!-- Patients Table -->
      <div *ngIf="filteredPatients.length > 0" style="background:#fff; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); overflow:hidden;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#e8eaf6; text-align:left;">
              <th style="padding:12px;">ID</th>
              <th style="padding:12px;">National No.</th>
              <th style="padding:12px;">Name</th>
              <th style="padding:12px;">Gender</th>
              <th style="padding:12px;">DOB</th>
              <th style="padding:12px;">Phone</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredPatients"
                (click)="openPatient(p.patient_id)"
                style="cursor:pointer; border-bottom:1px solid #eee;">
              <td style="padding:10px 12px;">{{ p.patient_id }}</td>
              <td style="padding:10px 12px;">{{ p.national_number }}</td>
              <td style="padding:10px 12px;">{{ p.first_name }} {{ p.father_name ? p.father_name : '' }} {{ p.surname }}</td>
              <td style="padding:10px 12px;">{{ p.gender }}</td>
              <td style="padding:10px 12px;">{{ p.dob }}</td>
              <td style="padding:10px 12px;">{{ p.phone_number }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p *ngIf="!loading && !error && filteredPatients.length === 0" style="margin-top:16px; color:#666;">
        No patients found.
      </p>
    </div>
  `,
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  showForm = false;
  formError: string | null = null;
  formSuccess: string | null = null;

  newPatient: Partial<Patient> = {
    national_number: '', first_name: '', surname: '', father_name: '',
    mother_name: '', gender: '', dob: '', phone_number: '', address: ''
  };

  constructor(
    private api: PatientsApi,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get filteredPatients(): Patient[] {
    if (!this.searchTerm) return this.patients;
    const s = this.searchTerm.toLowerCase();
    return this.patients.filter(p =>
      p.first_name.toLowerCase().includes(s) ||
      p.surname.toLowerCase().includes(s) ||
      (p.national_number && p.national_number.includes(s))
    );
  }

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
    this.api.list().subscribe({
      next: (data) => { this.patients = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load patients.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openPatient(id: number) {
    this.router.navigate(['/patients', id]);
  }

  addPatient() {
    this.formError = null;
    this.formSuccess = null;

    if (!this.newPatient.national_number || !this.newPatient.first_name || !this.newPatient.surname || !this.newPatient.gender) {
      this.formError = 'Please fill in all required fields (*)';
      return;
    }

    this.api.create(this.newPatient).subscribe({
      next: () => {
        this.formSuccess = 'Patient added successfully!';
        this.showForm = false;
        this.newPatient = { national_number: '', first_name: '', surname: '', father_name: '', mother_name: '', gender: '', dob: '', phone_number: '', address: '' };
        this.loadPatients();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.formError = err?.error?.message || 'Failed to add patient.';
        this.cdr.detectChanges();
      },
    });
  }
}
