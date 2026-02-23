import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PatientsComponent } from './features/patients/patients.component';
import { PatientDetailComponent } from './features/patients/patient-detail.component';
import { VisitDetailComponent } from './features/patients/visit-detail.component';
import { MyRecordComponent } from './features/my-record/my-record.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'patients', component: PatientsComponent },
      { path: 'patients/:id', component: PatientDetailComponent },
      { path: 'patients/:patientId/visits/:visitId', component: VisitDetailComponent },
      { path: 'my-record', component: MyRecordComponent },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
