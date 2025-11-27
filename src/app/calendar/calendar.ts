import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, setDoc } from '@angular/fire/firestore';

interface CalendarDay {
  day: number;
  opened: boolean;
  weekday: string;
  unlocked_content_text?: string;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class Calendar implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private userId: string | null = null;
  
  protected readonly title = signal('Advent Calendar 2024');
  
  private readonly weekdays = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
  
  protected readonly days = signal<CalendarDay[]>(
    Array.from({ length: 24 }, (_, i) => ({
      day: i + 1,
      opened: false,
      weekday: this.weekdays[i % 6],
      unlocked_content_text: ''
    }))
  );

  async ngOnInit() {
    // Get the current user's UID
    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
      // Load the opened state from Firestore for all days
      await this.loadDaysFromFirestore();
      // Open all days on login
      await this.openAllDays();
    }
  }

  private async loadDaysFromFirestore(): Promise<void> {
    if (!this.userId) return;
    
    const updatedDays = [...this.days()];
    
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
        }
      } catch (error) {
        console.error(`Error loading day ${dayNum}:`, error);
      }
    }
    
    this.days.set(updatedDays);
  }

  protected async openDay(day: CalendarDay): Promise<void> {
    if (!day.opened) {
      day.opened = true;
      this.days.set([...this.days()]);
      
      // Save to Firestore
      await this.saveDayToFirestore(day);
    }
  }

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
          weekday: day.weekday
        });
      } catch (error) {
        console.error(`Error resetting day ${day.day}:`, error);
      }
    }
    console.log('All days reset');
  }
}
