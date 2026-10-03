import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { RecaptchaModule, RecaptchaComponent } from 'ng-recaptcha';
import { AnalyticsService } from '../../services/analytics.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RecaptchaModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  isDragging = false;
  uploadStatus = '';
  isUploading = false;
  showForm = false;
  selectedFile: File | null = null;

  // form fields
  firstName = '';
  lastName = '';
  email = '';
  phone = '';

  @ViewChild(RecaptchaComponent) recaptcha!: RecaptchaComponent;
  siteKey = environment.recaptchaSiteKey;
  captchaExecuting = false;

  constructor(
    private http: HttpClient,
    private analytics: AnalyticsService,
    private seo: SeoService
  ) {
    this.seo.updatePageMeta({
      title: 'Upload Print Files | Fresh Prints San Diego',
      description: 'Upload your print-ready PDF, PNG or JPG files to Fresh Prints for emergency and same-day printing in San Diego. Or call 619-500-1959.',
      keywords: 'upload print files San Diego, send files for rush printing, emergency printing file upload',
      canonical: 'https://realfreshprints.com/upload',
      ogImage: 'https://realfreshprints.com/assets/images/fresh_prints.png'
    });
  }

  // ---------------- File drag/drop ----------------
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('body')) {
      this.isDragging = false;
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
  }

  handleFile(file: File): void {
    // Clear previous status
    this.uploadStatus = '';

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadStatus = `❌ File type not allowed. Only PNG, JPG, and PDF are supported.`;
      return;
    }
    this.selectedFile = file;
    this.showForm = true;
    this.analytics.track('file_upload_start', { file_type: file.type });
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedFile = null;
  }

  // ---------------- Form submit ----------------
  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.firstName || !this.lastName || !this.email || !this.phone) {
      this.uploadStatus = '❌ Please fill out all required fields.';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email)) {
      this.uploadStatus = '❌ Please enter a valid email address.';
      return;
    }

    if (!this.selectedFile) {
      this.uploadStatus = '❌ No file selected.';
      return;
    }

    if (this.captchaExecuting || this.isUploading) return;

    if (!this.recaptcha) {
      this.uploadStatus = '❌ reCAPTCHA not ready. Please try again.';
      return;
    }

    this.uploadStatus = 'Verifying CAPTCHA...';
    this.isUploading = true;
    this.captchaExecuting = true;

    try {
      this.recaptcha.execute();
    } catch (err) {
      console.error('❌ reCAPTCHA execute error:', err);
      this.uploadStatus = '❌ reCAPTCHA execution failed.';
      this.cleanupCaptcha();
    }
  }

  onCaptchaResolved(token: string | null): void {
    // Ignore null tokens if we are not expecting a CAPTCHA
    if (!this.captchaExecuting) {
      return;
    }

    if (!token) {
      this.uploadStatus = '❌ reCAPTCHA verification failed. Please try again.';
      this.cleanupCaptcha();
      return;
    }

    console.log('✅ CAPTCHA resolved:', token);

    this.captchaExecuting = false;

    const payload = {
      fileName: this.selectedFile!.name,
      fileType: this.selectedFile!.type,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      recaptchaToken: token
    };

    this.uploadStatus = 'Requesting upload URL...';
    this.requestUploadUrl(payload);
  }

  formatPhone(event: Event): void {
    let input = (event.target as HTMLInputElement).value;

    // Strip all non-digits
    let digits = input.replace(/\D/g, "");

    // Limit to 10 digits
    if (digits.length > 10) {
      digits = digits.substring(0, 10);
    }

    // Format
    if (digits.length > 6) {
      this.phone = `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    } else if (digits.length > 3) {
      this.phone = `(${digits.substring(0, 3)}) ${digits.substring(3)}`;
    } else if (digits.length > 0) {
      this.phone = `(${digits}`;
    } else {
      this.phone = "";
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  isPhoneInvalid(): boolean {
    const digits = this.phone.replace(/\D/g, '');
    return digits.length > 0 && digits.length < 10;
  }


  // ---------------- Backend requests ----------------
  private requestUploadUrl(payload: any, attempt = 1): void {
    this.http.post<{ uploadUrl: string; fileKey: string }>(
      'https://q6qu4gywcqxh4psjlosdhn3zeq0oewzx.lambda-url.us-east-2.on.aws/',   // update this line
      payload
    ).subscribe({
      next: ({ uploadUrl }) => this.uploadFile(uploadUrl),
      error: (err) => {
        console.error(`❌ Failed to get upload URL (attempt ${attempt}):`, err);

        if (attempt < 2) {
          // Only retry if no CAPTCHA execution is currently in progress
          if (!this.captchaExecuting && this.recaptcha) {
            this.uploadStatus = '⚠️ Retry: getting a new reCAPTCHA token...';
            this.captchaExecuting = true;
            this.recaptcha.execute(); // triggers onCaptchaResolved with a new token
          } else {
            console.warn('⚠️ Retry skipped because CAPTCHA execution is already in progress.');
          }
        } else {
          this.uploadStatus = '❌ Failed to get upload URL';
          this.analytics.track('file_upload_failed', { stage: 'request_url' });
          this.cleanupCaptcha();
        }
      }
    });
  }

  private uploadFile(uploadUrl: string): void {
    this.uploadStatus = 'Uploading...';

    this.http.put(uploadUrl, this.selectedFile!, {
      headers: { 'Content-Type': this.selectedFile!.type }
    }).subscribe({
      next: () => {
        this.uploadStatus = '✅ Upload successful';
        this.analytics.track('generate_lead', {
          lead_source: 'file_upload',
          file_type: this.selectedFile!.type
        });
        this.resetForm();
        this.cleanupCaptcha();
      },
      error: (err) => {
        console.error('❌ Upload failed:', err);
        this.uploadStatus = '❌ Upload failed';
        this.analytics.track('file_upload_failed', { stage: 'upload' });
        this.cleanupCaptcha();
      }
    });
  }

  // ---------------- Helpers ----------------
  private resetForm(): void {
    this.closeForm();
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.phone = '';
  }

  private cleanupCaptcha(): void {
    this.isUploading = false;
    this.captchaExecuting = false;
    if (this.recaptcha) {
      this.recaptcha.reset();
    }
  }
}


