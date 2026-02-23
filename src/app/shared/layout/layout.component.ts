import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-layout',
  template: `
    <div style="display:flex; min-height:100vh; font-family:'Segoe UI',Arial,sans-serif;">
      <!-- Sidebar -->
      <nav style="width:240px; background:linear-gradient(180deg, #1a237e 0%, #283593 100%); color:#fff; padding:0; flex-shrink:0; display:flex; flex-direction:column;">
        
        <!-- Branding -->
        <div style="padding:24px 20px; border-bottom:1px solid rgba(255,255,255,0.1);">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
            <div style="width:36px; height:36px; background:rgba(255,255,255,0.15); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px;">
              &#9764;
            </div>
            <div>
              <div style="font-size:15px; font-weight:700; letter-spacing:0.5px;">Meer Medical</div>
              <div style="font-size:11px; opacity:0.6;">Center</div>
            </div>
          </div>
        </div>

        <!-- User info -->
        <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.08);">
          <div style="font-size:12px; opacity:0.5; margin-bottom:2px;">Signed in as</div>
          <div style="font-size:14px; font-weight:600;">{{ userName }}</div>
          <div style="font-size:11px; opacity:0.5; text-transform:capitalize;">{{ role }}</div>
        </div>

        <!-- Navigation -->
        <div style="padding:12px 0; flex:1;">
          <div style="padding:0 12px; margin-bottom:4px; font-size:11px; opacity:0.4; text-transform:uppercase; letter-spacing:1px; padding-left:20px;">
            Navigation
          </div>

          <!-- Admin links -->
          <a *ngIf="role === 'admin'" routerLink="/dashboard"
             style="display:flex; align-items:center; gap:10px; padding:10px 20px; color:#fff; text-decoration:none; font-size:14px; margin:2px 8px; border-radius:6px; transition:background 0.2s;"
             [style.background]="isActive('/dashboard') ? 'rgba(255,255,255,0.15)' : 'transparent'">
            <span style="font-size:18px;">&#9632;</span> Dashboard
          </a>

          <!-- Doctor / Nurse / Admin links -->
          <a *ngIf="role !== 'patient'" routerLink="/patients"
             style="display:flex; align-items:center; gap:10px; padding:10px 20px; color:#fff; text-decoration:none; font-size:14px; margin:2px 8px; border-radius:6px; transition:background 0.2s;"
             [style.background]="isActive('/patients') ? 'rgba(255,255,255,0.15)' : 'transparent'">
            <span style="font-size:18px;">&#9874;</span> Patients
          </a>

          <!-- Patient links -->
          <a *ngIf="role === 'patient'" routerLink="/my-record"
             style="display:flex; align-items:center; gap:10px; padding:10px 20px; color:#fff; text-decoration:none; font-size:14px; margin:2px 8px; border-radius:6px; transition:background 0.2s;"
             [style.background]="isActive('/my-record') ? 'rgba(255,255,255,0.15)' : 'transparent'">
            <span style="font-size:18px;">&#9874;</span> My Record
          </a>
        </div>

        <!-- Logout -->
        <div style="padding:16px 20px; border-top:1px solid rgba(255,255,255,0.1);">
          <button (click)="logout()"
                  style="width:100%; padding:10px; background:rgba(255,255,255,0.08); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; cursor:pointer; font-size:13px; transition:background 0.2s;"
                  onmouseenter="this.style.background='rgba(255,255,255,0.15)'"
                  onmouseleave="this.style.background='rgba(255,255,255,0.08)'">
            Logout
          </button>
        </div>
      </nav>

      <!-- Main content -->
      <div style="flex:1; display:flex; flex-direction:column;">
        <!-- Top bar -->
        <header style="background:#fff; padding:14px 24px; box-shadow:0 1px 3px rgba(0,0,0,0.08); display:flex; align-items:center; justify-content:space-between;">
          <div style="font-size:15px; color:#1a237e; font-weight:600;">Meer Medical Center</div>
          <div style="font-size:13px; color:#888;">Medical Consultations Management System</div>
        </header>

        <!-- Page content -->
        <main style="flex:1; background:#f0f2f5; overflow-y:auto;">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  userName = '';
  role = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    const user = this.auth.getUser();
    this.userName = user?.name ?? '';
    this.role = this.auth.getRole() ?? '';
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
