import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-files-redirect',
  template: `
    <p *ngIf="status">{{ status }}</p>
  `,
})
export class FilesRedirectComponent implements OnInit {
  status = 'Generating link...';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const fileKey = this.route.snapshot.paramMap.get('fileKey');
    const actionParam = this.route.snapshot.queryParamMap.get('action');

    if (!fileKey || !actionParam || !['download', 'view'].includes(actionParam)) {
      this.status = '❌ Invalid file link.';
      return;
    }

    const lambdaUrl = 'https://q6qu4gywcqxh4psjlosdhn3zeq0oewzx.lambda-url.us-east-2.on.aws/'; // update this line

    // Send correct payload for Lambda
    const payload = {
      action: 'generate_link',  // always "generate_link" for presigned URL generation
      fileKey,
      type: actionParam        // "download" or "view"
    };

    this.http.post<{ url: string }>(lambdaUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    })
    .subscribe({
      next: (res) => {
        if (res.url) {
          if (actionParam === 'download') {
            // Programmatically trigger download
            const link = document.createElement('a');
            link.href = res.url;
            link.download = fileKey;
            document.body.appendChild(link);
            link.click();
            link.remove();
          } else {

            window.location.href = res.url;
          }

          // Redirect to home page after download
          this.router.navigate(['/']);
        } else {
          this.status = '❌ Failed to generate link.';
        }
      },
      error: (err) => {
        console.error(err);
        this.status = '❌ Error generating link.';
      }
    });
  }
}


