import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PatientsApi, Patient } from '../../core/api/patients.api';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:24px;">
      <h2>Dashboard</h2>
      <p style="color:#666; margin-bottom:24px;">Welcome back, {{ userName }}.</p>

      <!-- Stats Cards -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; margin-bottom:32px;">
        <div style="background:#fff; padding:24px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); text-align:center;">
          <div style="font-size:36px; font-weight:bold; color:#1a237e;">{{ totalPatients }}</div>
          <div style="font-size:14px; color:#666; margin-top:4px;">Total Patients</div>
        </div>
        <div style="background:#fff; padding:24px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); text-align:center;">
          <div style="font-size:36px; font-weight:bold; color:#2e7d32;">{{ maleCount }}</div>
          <div style="font-size:14px; color:#666; margin-top:4px;">Male Patients</div>
        </div>
        <div style="background:#fff; padding:24px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); text-align:center;">
          <div style="font-size:36px; font-weight:bold; color:#c62828;">{{ femaleCount }}</div>
          <div style="font-size:14px; color:#666; margin-top:4px;">Female Patients</div>
        </div>
      </div>

      <!-- Recent Patients -->
      <div style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-top:0;">Recent Patients</h3>
        <table *ngIf="recentPatients.length > 0" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#e8eaf6; text-align:left;">
              <th style="padding:10px;">Name</th>
              <th style="padding:10px;">National No.</th>
              <th style="padding:10px;">Gender</th>
              <th style="padding:10px;">Phone</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of recentPatients" style="border-bottom:1px solid #eee;">
              <td style="padding:8px 10px;">{{ p.first_name }} {{ p.surname }}</td>
              <td style="padding:8px 10px;">{{ p.national_number }}</td>
              <td style="padding:8px 10px;">{{ p.gender }}</td>
              <td style="padding:8px 10px;">{{ p.phone_number }}</td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="recentPatients.length === 0" style="color:#666;">No patients yet.</p>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  userName = '';
  totalPatients = 0;
  maleCount = 0;
  femaleCount = 0;
  recentPatients: Patient[] = [];

  constructor(
    private api: PatientsApi,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userName = this.auth.getUser()?.name ?? '';

    this.api.list().subscribe({
      next: (patients) => {
        this.totalPatients = patients.length;
        this.maleCount = patients.filter(p => p.gender?.toLowerCase() === 'male').length;
        this.femaleCount = patients.filter(p => p.gender?.toLowerCase() === 'female').length;
        this.recentPatients = patients.slice(0, 5);
        this.cdr.detectChanges();
      },
    });
  }
}
