import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientsApi, Patient } from '../../core/api/patients.api';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="margin:0; color:#1a237e;">Patients</h2>
        <button *ngIf="role === 'admin' || role === 'nurse' || role === 'doctor'"
                (click)="showAdd = !showAdd"
                style="padding:8px 20px; background:#1a237e; color:#fff; border:none; border-radius:4px; cursor:pointer;">
          {{ showAdd ? 'Cancel' : '+ Add Patient' }}
        </button>
      </div>

      <!-- Search -->
      <input [(ngModel)]="search" placeholder="Search by name or national number..."
             style="width:100%; padding:10px 14px; border:2px solid #e0e0e0; border-radius:8px; margin-bottom:16px; font-size:14px; box-sizing:border-box;" />

      <!-- Add Patient Form -->
      <div *ngIf="showAdd" style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); margin-bottom:20px;">
        <h3 style="margin-top:0;">New Patient</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
          <div>
            <label style="font-size:12px; font-weight:bold;">National Number *</label>
            <input [(ngModel)]="newPatient.national_number" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:bold;">First Name *</label>
            <input [(ngModel)]="newPatient.first_name" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:bold;">Surname *</label>
            <input [(ngModel)]="newPatient.surname" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:bold;">Father Name</label>
            <input [(ngModel)]="newPatient.father_name" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:bold;">Mother Name</label>
            <input [(ngModel)]="newPatient.mother_name" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:bold;">Gender *</label>
            <select [(ngModel)]="newPatient.gender" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label style="font-size:12px; font-weight:bold;">Date of Birth</label>
            <input type="date" [(ngModel)]="newPatient.dob" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:bold;">Phone</label>
            <input [(ngModel)]="newPatient.phone_number" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:bold;">Address</label>
            <input [(ngModel)]="newPatient.address" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
          </div>
        </div>
        <button (click)="addPatient()" style="margin-top:12px; padding:8px 20px; background:#2e7d32; color:#fff; border:none; border-radius:4px; cursor:pointer;">
          Save Patient
        </button>
      </div>

      <!-- Patients Table -->
      <div style="background:#fff; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); overflow:hidden;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#e8eaf6; text-align:left;">
              <th style="padding:12px;">Name</th>
              <th style="padding:12px;">National No.</th>
              <th style="padding:12px;">Gender</th>
              <th style="padding:12px;">Phone</th>
              <th style="padding:12px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filtered" style="border-bottom:1px solid #eee; cursor:pointer;" (click)="viewPatient(p)">
              <td style="padding:10px 12px;">{{ p.first_name }} {{ p.father_name || '' }} {{ p.surname }}</td>
              <td style="padding:10px 12px;">{{ p.national_number }}</td>
              <td style="padding:10px 12px;">{{ p.gender }}</td>
              <td style="padding:10px 12px;">{{ p.phone_number || 'N/A' }}</td>
              <td style="padding:10px 12px;" (click)="$event.stopPropagation()">
                <button (click)="viewPatient(p)" style="padding:4px 10px; background:#1a237e; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:12px; margin-right:6px;">
                  View
                </button>
                <button *ngIf="role === 'admin'" (click)="editPatient(p)" style="padding:4px 10px; background:#f57c00; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:12px;">
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="!loading && filtered.length === 0" style="padding:20px; text-align:center; color:#666;">No patients found.</p>
        <p *ngIf="loading" style="padding:20px; text-align:center;">Loading patients...</p>
      </div>

      <!-- Edit Patient Modal -->
      <div *ngIf="editingPatient" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;">
        <div style="background:#fff; padding:24px; border-radius:12px; width:600px; max-width:90%; max-height:80vh; overflow-y:auto;">
          <h3 style="margin-top:0; color:#1a237e;">Edit Patient</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label style="font-size:12px; font-weight:bold;">National Number *</label>
              <input [(ngModel)]="editData.national_number" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
            </div>
            <div>
              <label style="font-size:12px; font-weight:bold;">First Name *</label>
              <input [(ngModel)]="editData.first_name" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
            </div>
            <div>
              <label style="font-size:12px; font-weight:bold;">Surname *</label>
              <input [(ngModel)]="editData.surname" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
            </div>
            <div>
              <label style="font-size:12px; font-weight:bold;">Father Name</label>
              <input [(ngModel)]="editData.father_name" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
            </div>
            <div>
              <label style="font-size:12px; font-weight:bold;">Mother Name</label>
              <input [(ngModel)]="editData.mother_name" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
            </div>
            <div>
              <label style="font-size:12px; font-weight:bold;">Gender *</label>
              <select [(ngModel)]="editData.gender" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label style="font-size:12px; font-weight:bold;">Date of Birth</label>
              <input type="date" [(ngModel)]="editData.dob" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
            </div>
            <div>
              <label style="font-size:12px; font-weight:bold;">Phone</label>
              <input [(ngModel)]="editData.phone_number" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
            </div>
            <div style="grid-column: span 2;">
              <label style="font-size:12px; font-weight:bold;">Address</label>
              <input [(ngModel)]="editData.address" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;" />
            </div>
          </div>
          <div style="margin-top:16px; display:flex; gap:10px;">
            <button (click)="saveEdit()" style="padding:8px 20px; background:#2e7d32; color:#fff; border:none; border-radius:4px; cursor:pointer;">Save Changes</button>
            <button (click)="editingPatient = null" style="padding:8px 20px; background:transparent; border:1px solid #999; border-radius:4px; cursor:pointer;">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  loading = true;
  search = '';
  showAdd = false;
  role: string | null = null;

  newPatient: any = { gender: 'male' };
  editingPatient: Patient | null = null;
  editData: any = {};

  constructor(
    private api: PatientsApi,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.role = this.auth.getRole();
    this.loadPatients();
  }

  loadPatients() {
    this.api.list().subscribe({
      next: (data) => { this.patients = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  get filtered(): Patient[] {
    if (!this.search) return this.patients;
    const s = this.search.toLowerCase();
    return this.patients.filter(p =>
      (p.first_name || '').toLowerCase().includes(s) ||
      (p.surname || '').toLowerCase().includes(s) ||
      (p.national_number || '').toLowerCase().includes(s)
    );
  }

  viewPatient(p: Patient) {
    this.router.navigate(['/patients', p.patient_id]);
  }

  addPatient() {
    if (!this.newPatient.national_number || !this.newPatient.first_name || !this.newPatient.surname) {
      alert('Fill required fields (National Number, First Name, Surname)');
      return;
    }
    this.api.create(this.newPatient).subscribe({
      next: () => {
        this.showAdd = false;
        this.newPatient = { gender: 'male' };
        this.loadPatients();
      },
      error: (err) => alert(err?.error?.message || 'Failed to create patient.'),
    });
  }

  editPatient(p: Patient) {
    this.editingPatient = p;
    this.editData = {
      national_number: p.national_number,
      first_name: p.first_name,
      surname: p.surname,
      father_name: p.father_name || '',
      mother_name: p.mother_name || '',
      gender: p.gender,
      dob: p.dob || '',
      phone_number: p.phone_number || '',
      address: p.address || '',
    };
  }

  saveEdit() {
    if (!this.editingPatient) return;
    if (!this.editData.national_number || !this.editData.first_name || !this.editData.surname) {
      alert('Fill required fields.');
      return;
    }
    this.api.update(this.editingPatient.patient_id, this.editData).subscribe({
      next: () => {
        this.editingPatient = null;
        this.loadPatients();
      },
      error: (err) => alert(err?.error?.message || 'Failed to update patient.'),
    });
  }
}
