// video-modal.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="video-modal">
      <iframe
        [src]="data.videoUrl"
        width="100%"
        height="100%"
        frameborder="0"
        allowfullscreen>
      </iframe>
    </div>
  `,
  styles: [`
    .video-modal {
      width: 100%;
      height: 100%;
    }
  `]
})
export class VideoModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { videoUrl: SafeResourceUrl }) {}
}
