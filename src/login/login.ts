import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, authState } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  private auth = inject(Auth);
  
  protected username = signal('');
  protected password = signal('');
  protected errorMessage = signal('');
  protected isLoading = signal(false);

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
      this.errorMessage.set('Please enter both email and password');
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
      let message = 'Login failed. Please try again.';
      
      if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      } else if (error.code === 'auth/user-disabled') {
        message = 'This account has been disabled.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
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
}
