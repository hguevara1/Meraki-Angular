import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HeaderComponent } from '../header/header.component'
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoModalComponent } from '../video-modal/video-modal.component';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

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
export class TortasComponent implements OnInit, OnDestroy {
  tortas: Torta[] = [];
  displayedColumns: string[] = ['nombre', 'subrecetasCount', 'acciones'];
  isLoading: boolean = true;
  totalTortas: number = 0;
  private subscriptions: Subscription = new Subscription();
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.cargarTortas();
  }

  ngOnDestroy() {
    // Limpiar todas las suscripciones
    this.subscriptions.unsubscribe();
  }

  cargarTortas() {
    this.isLoading = true;

    // Verificar que http esté definido antes de suscribirse
    if (!this.http) {
      console.error('HttpClient no está disponible');
      this.isLoading = false;
      return;
    }

    const tortasSubscription = this.http.get<Torta[]>(`${environment.apiUrl}/tortas`)
      .subscribe({
        next: (data) => {
          this.tortas = data;
          this.totalTortas = data.length;
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error cargando tortas:', error);
          this.isLoading = false;
          this.mostrarError('Error al cargar las tortas');

          // En testing, podríamos tener datos mock
          if (this.isTestingEnvironment()) {
            this.tortas = [];
            this.totalTortas = 0;
          }
        }
      });

    this.subscriptions.add(tortasSubscription);
  }

  eliminarTorta(id: string) {
    if (!id) {
      console.error('ID de torta no válido');
      return;
    }

    if (confirm('¿Estás seguro de eliminar esta torta?')) {
      const deleteSubscription = this.http.delete(`${environment.apiUrl}/tortas/${id}`)
        .subscribe({
          next: () => {
            this.mostrarMensaje('Torta eliminada correctamente');
            this.cargarTortas(); // Recargar la lista
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error eliminando torta:', error);
            this.mostrarError('Error al eliminar la torta');
          }
        });

      this.subscriptions.add(deleteSubscription);
    }
  }

  private mostrarMensaje(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
    });
  }

  private mostrarError(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private isTestingEnvironment(): boolean {
      // Verificar si estamos en entorno de testing (Karma)
      return window.location.href.includes('localhost:9876') ||
             window.location.href.includes('karma') ||
             window.location.href.includes('test');
    }

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
    if (!videoUrl) return;

    const videoId = this.extractYouTubeId(videoUrl);
    if (videoId) {
      // Abrir en nueva pestaña
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    }
  }

  // Opcional: Método para abrir modal con el video
  openVideoModal(videoId: string) {
    if (!videoId) return;

    const videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?autoplay=1`
    );

    this.dialog.open(VideoModalComponent, {
      data: { videoUrl },
      width: '80%',
      height: '80%'
    });
  }
}
