import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HeaderComponent } from '../header/header.component'
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoModalComponent } from '../video-modal/video-modal.component';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface Torta {
  _id?: string;
  nombre: string;
  subrecetas: any[];
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-tortas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    VideoModalComponent,
  ],
  templateUrl: './tortas.component.html',
  styleUrls: ['./tortas.component.css']
})
export class TortasComponent implements OnInit {
  tortas: Torta[] = [];
  displayedColumns: string[] = ['nombre', 'subrecetasCount', 'acciones'];
  isLoading: boolean = true;
  totalTortas: number = 0;

  constructor(private http: HttpClient,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog) {}

  // Método para obtener el thumbnail de YouTube
    getYouTubeThumbnail(videoUrl: string): string {
      if (!videoUrl) return '';

      const videoId = this.extractYouTubeId(videoUrl);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
      return '';
    }

    // Método para extraer ID de YouTube
    private extractYouTubeId(url: string): string | null {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[7].length === 11) ? match[7] : null;
    }

    // Abrir video en modal o nueva pestaña
    openVideo(videoUrl: string) {
      const videoId = this.extractYouTubeId(videoUrl);
      if (videoId) {
        // Abrir en nueva pestaña
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');

        // O alternativa: abrir en modal
        // this.openVideoModal(videoId);
      }
    }

    // Opcional: Método para abrir modal con el video
    openVideoModal(videoId: string) {
      const videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${videoId}?autoplay=1`
      );

      this.dialog.open(VideoModalComponent, {
        data: { videoUrl },
        width: '80%',
        height: '80%'
      });
    }


  ngOnInit() {
    this.cargarTortas();
  }

  cargarTortas() {
    this.isLoading = true;
    this.http.get<Torta[]>('http://localhost:5000/api/tortas')
      .subscribe({
        next: (data) => {
          this.tortas = data;
          this.totalTortas = data.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando tortas:', error);
          this.isLoading = false;
        }
      });
  }

  eliminarTorta(id: string) {
    if (confirm('¿Estás seguro de eliminar esta torta?')) {
      this.http.delete(`http://localhost:5000/api/tortas/${id}`)
        .subscribe({
          next: () => {
            this.cargarTortas(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error eliminando torta:', error);
          }
        });
    }
  }
}
