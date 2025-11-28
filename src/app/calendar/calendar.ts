import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, setDoc } from '@angular/fire/firestore';
// Storage can be provided in app.config.ts; here we only persist URLs in Firestore
import { Popup } from '../popup/popup';
import { Header } from '../header/header';

interface CalendarDay {
  day: number;
  opened: boolean;
  weekday: string;
  unlocked_content_text?: string;
  image_url?: string;
  isAvailable?: boolean;
  daysUntilAvailable?: number;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
  imports: [Popup, Header]
})
export class Calendar implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private userId: string | null = null;
  
  protected readonly title = signal(' Julekalender 2025!');
  protected readonly username = signal<string>('');
  protected readonly isLoading = signal<boolean>(true);
  protected readonly countdownMessage = signal<string>('');
  protected readonly testMode = signal<boolean>(false);
  protected readonly showPopup = signal<boolean>(false);
  protected readonly selectedDay = signal<CalendarDay | null>(null);
  
  private readonly weekdays = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
  
  protected readonly days = signal<CalendarDay[]>(
    Array.from({ length: 24 }, (_, i) => ({
      day: i + 1,
      opened: false,
      weekday: this.weekdays[i % 7],
      unlocked_content_text: '',
      isAvailable: false,
      daysUntilAvailable: 0
    }))
  );

  async ngOnInit() {
    // Get the current user's UID
    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
      this.isLoading.set(true);
      // Load user profile to get username
      await this.loadUserProfile();
      // Load the opened state from Firestore for all days
      await this.loadDaysFromFirestore();
      // Update availability based on current date
      this.updateDaysAvailability();
      this.isLoading.set(false);
    }
  }

  private updateDaysAvailability(): void {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (11 = December)
    const currentDay = now.getDate();
    
    const updatedDays = this.days().map(day => {
      // Check if it's December and the day is available
      const targetDate = new Date(currentYear, 11, day.day); // December is month 11
      const isAvailable = now >= targetDate;
      
      // Calculate days until available
      const daysUntilAvailable = isAvailable ? 0 : Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...day,
        isAvailable,
        daysUntilAvailable
      };
    });
    
    this.days.set(updatedDays);
  }

  private async loadUserProfile(): Promise<void> {
    if (!this.userId) return;
    
    const userDocRef = doc(this.firestore, `users/${this.userId}`);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.username.set(data['username'] || 'Guest');
      } else {
        this.username.set('Guest');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.username.set('Guest');
    }
  }

  private async loadDaysFromFirestore(): Promise<void> {
    if (!this.userId) return;
    
    const updatedDays = this.days().map(day => ({ ...day }));
    
    for (let i = 0; i < 24; i++) {
      const dayNum = i + 1;
      // Use user-specific path: users/{userId}/advent_calendar_days/day_{dayNum}
      const docRef = doc(this.firestore, `users/${this.userId}/advent_calendar_days`, `day_${dayNum}`);
      
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          updatedDays[i].opened = data['opened'] || false;
          updatedDays[i].unlocked_content_text = data['unlocked_content_text'] || '';
          updatedDays[i].image_url = data['image_url'] || '';
          console.log(`Day ${dayNum} loaded: opened=${updatedDays[i].opened}, content="${updatedDays[i].unlocked_content_text}"`);
        } else {
          console.log(`Day ${dayNum}: No document found in Firestore`);
        }
      } catch (error) {
        console.error(`Error loading day ${dayNum}:`, error);
      }
    }
    
    this.days.set([...updatedDays]);
    console.log(`Total days loaded:`, updatedDays.filter(d => d.opened).length, 'opened');
  }

  protected async openDay(day: CalendarDay): Promise<void> {
    // If already opened, just show the popup
    if (day.opened) {
      this.selectedDay.set(day);
      this.showPopup.set(true);
      return;
    }
    
    // Check if the day is available (skip check in test mode)
    if (!this.testMode() && !day.isAvailable) {
      if (day.daysUntilAvailable === 1) {
        this.countdownMessage.set(`Denne dag kan åbnes i morgen! 🎄`);
      } else {
        this.countdownMessage.set(`Denne dag kan åbnes om ${day.daysUntilAvailable} dage! 🎄`);
      }
      
      // Clear message after 3 seconds
      setTimeout(() => this.countdownMessage.set(''), 3000);
      return;
    }
    
    // Open the day for the first time
    day.opened = true;
    this.days.set([...this.days()]);
    
    // Save to Firestore
    await this.saveDayToFirestore(day);
    
    // Show popup
    this.selectedDay.set(day);
    this.showPopup.set(true);
  }

  protected closePopup(): void {
    this.showPopup.set(false);
    this.selectedDay.set(null);
  }

  // Images are stored in Firebase Storage; we keep only a link (image_url) in Firestore per day

  private async saveDayToFirestore(day: CalendarDay): Promise<void> {
    if (!this.userId) return;
    
    // Use user-specific path: users/{userId}/advent_calendar_days/day_{dayNum}
    const docRef = doc(this.firestore, `users/${this.userId}/advent_calendar_days`, `day_${day.day}`);
    
    try {
      await setDoc(docRef, {
        day: day.day,
        opened: day.opened,
        openedAt: new Date().toISOString(),
        unlocked_content_text: day.unlocked_content_text || '',
        image_url: day.image_url || '',
        weekday: day.weekday
      });
      console.log(`Day ${day.day} saved to Firestore for user ${this.userId}`);
    } catch (error) {
      console.error(`Error saving day ${day.day}:`, error);
    }
  }

  protected async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  protected toggleTestMode(): void {
    this.testMode.set(!this.testMode());
    console.log(`Test mode: ${this.testMode() ? 'ON' : 'OFF'}`);
  }

  protected async openAllDays(): Promise<void> {
    const updatedDays = this.days().map(day => ({
      ...day,
      opened: true
    }));
    this.days.set(updatedDays);

    // Save all days to Firestore
    for (const day of updatedDays) {
      await this.saveDayToFirestore(day);
    }
  }

  protected async resetAllDays(): Promise<void> {
    if (!this.userId) return;
    
    const updatedDays = this.days().map(day => ({
      ...day,
      opened: false
    }));
    this.days.set(updatedDays);

    // Update all days in Firestore
    for (const day of updatedDays) {
      const docRef = doc(this.firestore, `users/${this.userId}/advent_calendar_days`, `day_${day.day}`);
      try {
        await setDoc(docRef, {
          day: day.day,
          opened: false,
          resetAt: new Date().toISOString(),
          unlocked_content_text: day.unlocked_content_text || '',
          image_url: day.image_url || '',
          weekday: day.weekday
        });
      } catch (error) {
        console.error(`Error resetting day ${day.day}:`, error);
      }
    }
    console.log('All days reset');
  }
}
