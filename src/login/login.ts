import { Component, signal, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, authState } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit, AfterViewInit {
  private auth = inject(Auth);
  @ViewChild('snowCanvas', { static: false }) snowCanvas!: ElementRef<HTMLCanvasElement>;
  
  protected username = signal('');
  protected password = signal('');
  protected errorMessage = signal('');
  protected isLoading = signal(false);

  private snowflakes: Array<{x: number, y: number, radius: number, speed: number, drift: number}> = [];
  private animationId: number | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check if user is already logged in
    authState(this.auth).subscribe(user => {
      if (user) {
        // User is already logged in, redirect to calendar
        this.router.navigate(['/calendar']);
      }
    });
  }

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set('');
    
    if (!this.username() || !this.password()) {
      this.errorMessage.set('Indtast venligst både e-mail og adgangskode');
      return;
    }

    this.isLoading.set(true);

    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        this.username(),
        this.password()
      );
      
      console.log('Login successful:', userCredential.user);
      
      // Navigate to the calendar after successful login
      this.router.navigate(['/calendar']);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle Firebase Auth errors
      let message = 'Login mislykkedes. Prøv venligst igen.';
      
      if (error.code === 'auth/invalid-email') {
        message = 'Ugyldig e-mail adresse format.';
      } else if (error.code === 'auth/user-disabled') {
        message = 'Denne konto er blevet deaktiveret.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'Ingen konto fundet med denne e-mail.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Forkert adgangskode.';
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Ugyldig e-mail eller adgangskode.';
      }
      
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected updateUsername(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.username.set(input.value);
  }

  protected updatePassword(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.password.set(input.value);
  }

  ngAfterViewInit(): void {
    this.initSnowfall();
  }

  private initSnowfall(): void {
    const canvas = this.snowCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size and create snowflakes based on screen size
    const initializeSnowflakes = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Adjust snowflake count and size based on screen width
      const isMobile = window.innerWidth <= 768;
      const snowflakeCount = isMobile ? 75 : 150;
      const maxRadius = isMobile ? 2.5 : 3;
      const minRadius = isMobile ? 0.8 : 1;
      
      // Clear existing snowflakes
      this.snowflakes = [];
      
      // Create new snowflakes
      for (let i = 0; i < snowflakeCount; i++) {
        this.snowflakes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * (maxRadius - minRadius) + minRadius,
          speed: Math.random() * 1 + 0.5,
          drift: Math.random() * 0.5 - 0.25
        });
      }
    };
    
    initializeSnowflakes();
    window.addEventListener('resize', initializeSnowflakes);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();

      this.snowflakes.forEach(flake => {
        ctx.moveTo(flake.x, flake.y);
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);

        // Update position
        flake.y += flake.speed;
        flake.x += flake.drift;

        // Reset snowflake if it goes off screen
        if (flake.y > canvas.height) {
          flake.y = 0;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width) {
          flake.x = 0;
        } else if (flake.x < 0) {
          flake.x = canvas.width;
        }
      });

      ctx.fill();
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
