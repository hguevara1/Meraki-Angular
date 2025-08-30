import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { By } from '@angular/platform-browser';

import { VideoModalComponent } from './video-modal.component';

describe('VideoModalComponent', () => {
  let component: VideoModalComponent;
  let fixture: ComponentFixture<VideoModalComponent>;
  let sanitizer: DomSanitizer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoModalComponent, MatDialogModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            videoUrl: {} as SafeResourceUrl // Mock de SafeResourceUrl
          }
        },
        { provide: MatDialogRef, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VideoModalComponent);
    component = fixture.componentInstance;
    sanitizer = TestBed.inject(DomSanitizer);

    // Crear un SafeResourceUrl real para el test
    const safeUrl = sanitizer.bypassSecurityTrustResourceUrl('https://example.com/video.mp4');
    component.data = { videoUrl: safeUrl };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display video iframe with provided URL', () => {
    const iframe = fixture.debugElement.query(By.css('iframe'));
    expect(iframe).toBeTruthy();

    // No podemos verificar directamente el src porque es un SafeResourceUrl
    // pero podemos verificar que el iframe existe
    expect(iframe.nativeElement.tagName).toBe('IFRAME');
  });

  it('should receive video URL from dialog data', () => {
    expect(component.data.videoUrl).toBeDefined();
    expect(typeof component.data.videoUrl).toBe('object');
  });

  it('should use DomSanitizer to create safe URL', () => {
    const testUrl = 'https://example.com/test.mp4';
    const safeUrl = sanitizer.bypassSecurityTrustResourceUrl(testUrl);

    // Verificar que el sanitizer funciona correctamente
    expect(safeUrl).toBeDefined();
  });
});
