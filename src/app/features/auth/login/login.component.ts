// src/app/features/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { landingRouteForRole } from '../../../core/auth/landing';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="min-height:100vh; display:flex; align-items:center; justify-content:center;
                background: linear-gradient(135deg, #1a237e 0%, #3949ab 40%, #e8eaf6 70%, #ffffff 100%);
                font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="display:flex; background:#fff; border-radius:16px; box-shadow:0 8px 32px rgba(0,0,0,0.18);
                  overflow:hidden; max-width:860px; width:90%;">
        
        <!-- Left side - Image & Branding -->
        <div style="flex:1; background: linear-gradient(180deg, #1a237e 0%, #283593 100%);
                    padding:48px 32px; display:flex; flex-direction:column; align-items:center; justify-content:center;
                    min-height:480px;">
          <img src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop&q=80"
               alt="Healthcare Professional"
               style="width:200px; height:200px; border-radius:50%; object-fit:cover; border:4px solid rgba(255,255,255,0.3); margin-bottom:24px;" />
          <div style="color:#fff; text-align:center;">
            <div style="font-size:13px; letter-spacing:3px; text-transform:uppercase; opacity:0.7; margin-bottom:8px;">Welcome to</div>
            <div style="font-size:26px; font-weight:700; letter-spacing:1px;">Meer Medical Center</div>
            <div style="width:40px; height:3px; background:rgba(255,255,255,0.5); margin:16px auto;"></div>
            <div style="font-size:13px; opacity:0.6; line-height:1.6;">Medical Consultations<br>Management System</div>
          </div>
        </div>

        <!-- Right side - Login Form -->
        <div style="flex:1; padding:48px 40px; display:flex; flex-direction:column; justify-content:center;">
          <div style="margin-bottom:32px;">
            <h2 style="margin:0 0 8px 0; font-size:24px; color:#1a237e;">Sign In</h2>
            <p style="margin:0; color:#888; font-size:14px;">Enter your credentials to continue</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div style="margin-bottom:20px;">
              <label style="font-size:13px; font-weight:600; color:#555; display:block; margin-bottom:6px;">Username</label>
              <input
                style="width:100%; padding:12px 14px; border:2px solid #e0e0e0; border-radius:8px; font-size:15px;
                       box-sizing:border-box; outline:none; transition:border-color 0.2s;"
                type="text"
                formControlName="username"
                autocomplete="username"
                placeholder="Enter your username"
                onfocus="this.style.borderColor='#3949ab'"
                onblur="this.style.borderColor='#e0e0e0'"
              />
            </div>

            <div style="margin-bottom:24px;">
              <label style="font-size:13px; font-weight:600; color:#555; display:block; margin-bottom:6px;">Password</label>
              <input
                style="width:100%; padding:12px 14px; border:2px solid #e0e0e0; border-radius:8px; font-size:15px;
                       box-sizing:border-box; outline:none; transition:border-color 0.2s;"
                type="password"
                formControlName="password"
                autocomplete="current-password"
                placeholder="Enter your password"
                onfocus="this.style.borderColor='#3949ab'"
                onblur="this.style.borderColor='#e0e0e0'"
              />
            </div>

            <button
              style="width:100%; padding:14px; background: linear-gradient(135deg, #1a237e, #3949ab); color:#fff;
                     border:none; border-radius:8px; font-size:16px; font-weight:600; cursor:pointer;
                     transition:opacity 0.2s; letter-spacing:0.5px;"
              [disabled]="form.invalid || loading"
              [style.opacity]="form.invalid || loading ? '0.6' : '1'">
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>

            <p *ngIf="error" style="color:#c62828; margin-top:16px; font-size:14px; text-align:center; background:#ffebee; padding:10px; border-radius:6px;">
              {{ error }}
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loading = false;
  error: string | null = null;

  form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    const username = this.form.controls.username.value;
    const password = this.form.controls.password.value;

    this.auth.login(username, password).subscribe({
      next: () => {
        this.loading = false;
        const role = this.auth.getRole();
        this.router.navigateByUrl(landingRouteForRole(role));
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Login failed.';
      },
    });
  }
}
