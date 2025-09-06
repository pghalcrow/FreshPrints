import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit, OnDestroy {
  isDragging = false;
  uploadStatus = '';
  private isUploading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    window.addEventListener('dragover', this.onDragOver);
    window.addEventListener('dragleave', this.onDragLeave);
    window.addEventListener('drop', this.onDrop);
  }

  ngOnDestroy() {
    window.removeEventListener('dragover', this.onDragOver);
    window.removeEventListener('dragleave', this.onDragLeave);
    window.removeEventListener('drop', this.onDrop);
  }

  onFileSelected = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadFile(file);
  };

  onDragOver = (event: DragEvent) => {
    event.preventDefault();
    this.isDragging = true;
  };

  onDragLeave = (event: DragEvent) => {
    event.preventDefault();
    this.isDragging = false;
  };

  onDrop = (event: DragEvent) => {
    event.preventDefault();
    this.isDragging = false;

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    this.uploadFile(file);
  };

  uploadFile(file: File) {
    if (this.isUploading) {
      console.warn('⚠️ Upload already in progress, ignoring duplicate.');
      return;
    }

    // Check allowed file types (customize this list!)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadStatus = `❌ File type not allowed. Only PNG, JPG, and PDF are supported.`;
      return;
    }

    this.isUploading = true;

    console.log('➡️ uploadFile() triggered for:', file.name, 'at', new Date().toISOString());

    this.uploadStatus = 'Requesting upload URL...';

    this.http.post<{ uploadUrl: string; fileKey: string }>(
        'https://q6qu4gywcqxh4psjlosdhn3zeq0oewzx.lambda-url.us-east-2.on.aws/',
        { fileName: file.name, fileType: file.type }
      )
      .subscribe({
        next: ({ uploadUrl }) => {
          this.uploadStatus = 'Uploading...';

          this.http.put(uploadUrl, file).subscribe({
            next: () => {
              this.uploadStatus = '✅ Upload successful';
              this.isUploading = false;
            },
            error: (err) => {
              console.error('Upload failed:', err);
              this.uploadStatus = '❌ Upload failed';
              this.isUploading = false;
            },
          });
        },
        error: () => {
          this.uploadStatus = '❌ Failed to get upload URL';
          this.isUploading = false;
        },
      });
  }
}

