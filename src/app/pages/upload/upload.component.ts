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
    this.uploadStatus = 'Requesting upload URL...';

    this.http
      .post<{ uploadUrl: string; fileKey: string }>('http://localhost:3000/file', {
        fileName: file.name,
        fileType: file.type,
      })
      .subscribe({
        next: ({ uploadUrl }) => {
          this.uploadStatus = 'Uploading...';

          this.http.put(uploadUrl, file, {
            headers: { 'Content-Type': file.type },
          }).subscribe({
            next: () => {
              this.uploadStatus = '✅ Upload successful';
            },
            error: () => {
              this.uploadStatus = '❌ Upload failed';
            },
          });
        },
        error: () => {
          this.uploadStatus = '❌ Failed to get upload URL';
        },
      });
  }
}

