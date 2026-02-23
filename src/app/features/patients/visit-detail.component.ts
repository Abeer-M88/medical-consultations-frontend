import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsApi, PrimaryMedicalInfo, ClinicalNote, TestResult } from '../../core/api/patients.api';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:24px;">
      <button (click)="goBack()" style="margin-bottom:16px; padding:6px 14px; background:transparent; border:1px solid #999; border-radius:4px; cursor:pointer;">
        &larr; Back to Patient
      </button>

      <h2>Visit #{{ visitId }}</h2>

      <!-- ===== VITALS SECTION ===== -->
      <div style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); margin-bottom:20px;">
        <h3 style="margin-top:0;">Primary Medical Info (Vitals)</h3>

        <!-- Display existing vitals -->
        <div *ngIf="vitals" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; font-size:14px; margin-bottom:12px;">
          <div><strong>Blood Pressure:</strong> {{ vitals.bp || 'N/A' }}</div>
          <div><strong>SpO2:</strong> {{ vitals.spo2 || 'N/A' }}</div>
          <div><strong>Glucose:</strong> {{ vitals.glucose || 'N/A' }}</div>
          <div><strong>Temperature:</strong> {{ vitals.temperature || 'N/A' }}</div>
          <div><strong>Weight:</strong> {{ vitals.weight || 'N/A' }}</div>
          <div><strong>Pulse:</strong> {{ vitals.pulse || 'N/A' }}</div>
        </div>
        <p *ngIf="!vitals && !vitalsLoading && !showVitalsForm" style="color:#666;">No vitals recorded.</p>

        <!-- Add vitals form (nurse/doctor only) -->
        <button *ngIf="!vitals && !showVitalsForm && canEditMedical"
                (click)="showVitalsForm = true"
                style="padding:6px 14px; background:#2e7d32; color:#fff; border:none; border-radius:4px; cursor:pointer;">
          + Add Vitals
        </button>

        <div *ngIf="showVitalsForm" style="margin-top:12px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
          <div>
            <label style="font-size:12px; font-weight:bold;">BP</label>
            <input [(ngModel)]="newVitals.bp" placeholder="e.g. 120/80" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:bold;">SpO2</label>
            <input type="number" [(ngModel)]="newVitals.spo2" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:bold;">Glucose</label>
            <input type="number" [(ngModel)]="newVitals.glucose" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:bold;">Temperature</label>
            <input type="number" step="0.1" [(ngModel)]="newVitals.temperature" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:bold;">Weight (kg)</label>
            <input type="number" step="0.1" [(ngModel)]="newVitals.weight" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:bold;">Pulse</label>
            <input type="number" [(ngModel)]="newVitals.pulse" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
          </div>
          <div style="grid-column: span 3; margin-top:8px;">
            <button (click)="saveVitals()" style="padding:6px 16px; background:#2e7d32; color:#fff; border:none; border-radius:4px; cursor:pointer; margin-right:8px;">Save Vitals</button>
            <button (click)="showVitalsForm = false" style="padding:6px 16px; background:transparent; border:1px solid #999; border-radius:4px; cursor:pointer;">Cancel</button>
          </div>
        </div>
      </div>

      <!-- ===== CLINICAL NOTES SECTION ===== -->
      <div style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin-top:0;">Clinical Notes</h3>
          <button *ngIf="role === 'doctor' && !showNoteForm"
                  (click)="showNoteForm = true"
                  style="padding:6px 14px; background:#2e7d32; color:#fff; border:none; border-radius:4px; cursor:pointer;">
            + Add Note
          </button>
        </div>

        <!-- Existing notes -->
        <div *ngFor="let note of notes" style="border:1px solid #e0e0e0; border-radius:6px; padding:14px; margin-bottom:12px;">
          <div style="font-size:12px; color:#666; margin-bottom:8px;">{{ note.note_time }}</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:14px;">
            <div><strong>Visit Reason:</strong> {{ note.visit_reason || 'N/A' }}</div>
            <div><strong>Medical History:</strong> {{ note.medical_history || 'N/A' }}</div>
            <div><strong>Medications:</strong> {{ note.medications || 'N/A' }}</div>
            <div><strong>Exam Notes:</strong> {{ note.exam_notes || 'N/A' }}</div>
            <div><strong>Diagnosis:</strong> {{ note.diagnosis || 'N/A' }}</div>
            <div><strong>Prescription:</strong> {{ note.prescription || 'N/A' }}</div>
            <div style="grid-column: span 2;"><strong>Referrals:</strong> {{ note.referrals || 'N/A' }}</div>
          </div>
        </div>
        <p *ngIf="notes.length === 0 && !showNoteForm" style="color:#666;">No clinical notes recorded.</p>

        <!-- Add note form -->
        <div *ngIf="showNoteForm" style="border:1px solid #1a237e; border-radius:6px; padding:16px; margin-top:12px;">
          <h4 style="margin-top:0;">New Clinical Note</h4>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:12px; font-weight:bold;">Visit Reason</label>
              <textarea [(ngModel)]="newNote.visit_reason" rows="2" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"></textarea>
            </div>
            <div>
              <label style="font-size:12px; font-weight:bold;">Medical History</label>
              <textarea [(ngModel)]="newNote.medical_history" rows="2" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"></textarea>
            </div>
            <div>
              <label style="font-size:12px; font-weight:bold;">Medications</label>
              <textarea [(ngModel)]="newNote.medications" rows="2" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"></textarea>
            </div>
            <div>
              <label style="font-size:12px; font-weight:bold;">Exam Notes</label>
              <textarea [(ngModel)]="newNote.exam_notes" rows="2" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"></textarea>
            </div>
            <div>
              <label style="font-size:12px; font-weight:bold;">Diagnosis</label>
              <textarea [(ngModel)]="newNote.diagnosis" rows="2" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"></textarea>
            </div>
            <div>
              <label style="font-size:12px; font-weight:bold;">Prescription</label>
              <textarea [(ngModel)]="newNote.prescription" rows="2" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"></textarea>
            </div>
            <div style="grid-column: span 2;">
              <label style="font-size:12px; font-weight:bold;">Referrals</label>
              <textarea [(ngModel)]="newNote.referrals" rows="2" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"></textarea>
            </div>
          </div>
          <div style="margin-top:12px;">
            <button (click)="saveNote()" style="padding:6px 16px; background:#2e7d32; color:#fff; border:none; border-radius:4px; cursor:pointer; margin-right:8px;">Save Note</button>
            <button (click)="showNoteForm = false" style="padding:6px 16px; background:transparent; border:1px solid #999; border-radius:4px; cursor:pointer;">Cancel</button>
          </div>
        </div>
      </div>

      <!-- ===== TEST RESULTS SECTION ===== -->
      <div style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin-top:0;">Test Results</h3>
          <button *ngIf="canEditMedical && !showTestForm"
                  (click)="showTestForm = true"
                  style="padding:6px 14px; background:#2e7d32; color:#fff; border:none; border-radius:4px; cursor:pointer;">
            + Add Test
          </button>
        </div>

        <div *ngFor="let t of tests" style="border:1px solid #e0e0e0; border-radius:6px; padding:14px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:14px;">
            <div><strong>{{ t.test_type }}</strong></div>
            <div style="font-size:12px; color:#666;">{{ t.test_time }}</div>
          </div>
          <div style="margin-top:6px; font-size:14px;">Result: {{ t.test_result || 'Pending' }}</div>
          <div *ngIf="t.test_attachment" style="margin-top:4px; font-size:13px;">
            <a [href]="t.test_attachment" target="_blank">View Attachment</a>
          </div>
        </div>
        <p *ngIf="tests.length === 0 && !showTestForm" style="color:#666;">No test results recorded.</p>

        <!-- Add test form -->
        <div *ngIf="showTestForm" style="border:1px solid #1a237e; border-radius:6px; padding:16px; margin-top:12px;">
          <h4 style="margin-top:0;">New Test Result</h4>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:12px; font-weight:bold;">Test Type *</label>
              <input [(ngModel)]="newTest.test_type" placeholder="e.g. CBC, X-Ray" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
            </div>
            <div>
              <label style="font-size:12px; font-weight:bold;">Result</label>
              <input [(ngModel)]="newTest.test_result" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
            </div>
            <div style="grid-column: span 2;">
              <label style="font-size:12px; font-weight:bold;">Attachment Link</label>
              <input [(ngModel)]="newTest.test_link" style="width:100%; padding:6px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;" />
            </div>
          </div>
          <div style="margin-top:12px;">
            <button (click)="saveTest()" style="padding:6px 16px; background:#2e7d32; color:#fff; border:none; border-radius:4px; cursor:pointer; margin-right:8px;">Save Test</button>
            <button (click)="showTestForm = false" style="padding:6px 16px; background:transparent; border:1px solid #999; border-radius:4px; cursor:pointer;">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class VisitDetailComponent implements OnInit {
  visitId!: number;
  patientId!: number;
  role: string | null = null;
  userId!: number;

  vitals: PrimaryMedicalInfo | null = null;
  vitalsLoading = true;
  showVitalsForm = false;
  newVitals: any = {};

  notes: ClinicalNote[] = [];
  showNoteForm = false;
  newNote: any = {};

  tests: TestResult[] = [];
  showTestForm = false;
  newTest: any = {};

  get canEditMedical(): boolean {
    return this.role === 'nurse' || this.role === 'doctor';
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: PatientsApi,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.role = this.auth.getRole();
    this.userId = this.auth.getUser()?.user_id ?? 0;
    this.patientId = Number(this.route.snapshot.paramMap.get('patientId'));
    this.visitId = Number(this.route.snapshot.paramMap.get('visitId'));
    this.loadAll();
  }

  loadAll() {
    // Vitals
    this.api.getVitals(this.visitId).subscribe({
      next: (v) => { this.vitals = v; this.vitalsLoading = false; this.cdr.detectChanges(); },
      error: () => { this.vitalsLoading = false; this.cdr.detectChanges(); },
    });

    // Notes
    this.api.getNotes(this.visitId).subscribe({
      next: (n) => { this.notes = n; this.cdr.detectChanges(); },
      error: () => { this.cdr.detectChanges(); },
    });

    // Tests
    this.api.getTests(this.visitId).subscribe({
      next: (t) => { this.tests = t; this.cdr.detectChanges(); },
      error: () => { this.cdr.detectChanges(); },
    });
  }

  saveVitals() {
    this.api.saveVitals(this.visitId, { ...this.newVitals, user_id: this.userId }).subscribe({
      next: (v) => {
        this.vitals = v;
        this.showVitalsForm = false;
        this.cdr.detectChanges();
      },
      error: () => alert('Failed to save vitals.'),
    });
  }

  saveNote() {
    this.api.saveNote(this.visitId, { ...this.newNote, user_id: this.userId }).subscribe({
      next: () => {
        this.showNoteForm = false;
        this.newNote = {};
        this.api.getNotes(this.visitId).subscribe({
          next: (n) => { this.notes = n; this.cdr.detectChanges(); },
        });
      },
      error: () => alert('Failed to save note.'),
    });
  }

  saveTest() {
    if (!this.newTest.test_type) { alert('Test type is required.'); return; }
    this.api.saveTest(this.visitId, this.newTest).subscribe({
      next: () => {
        this.showTestForm = false;
        this.newTest = {};
        this.api.getTests(this.visitId).subscribe({
          next: (t) => { this.tests = t; this.cdr.detectChanges(); },
        });
      },
      error: () => alert('Failed to save test.'),
    });
  }

  goBack() {
    this.router.navigate(['/patients', this.patientId]);
  }
}
