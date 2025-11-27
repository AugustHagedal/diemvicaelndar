import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';

interface CalendarDay {
  day: number;
  opened: boolean;
  content: string;
  weekday: string;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class Calendar {
  private auth = inject(Auth);
  private router = inject(Router);
  
  protected readonly title = signal('Advent Calendar 2024');
  
  private readonly weekdays = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
  
  protected readonly days = signal<CalendarDay[]>(
    Array.from({ length: 24 }, (_, i) => ({
      day: i + 1,
      opened: false,
      content: this.getContentForDay(i + 1),
      weekday: this.weekdays[i % 6]
    }))
  );

  protected openDay(day: CalendarDay): void {
    if (!day.opened) {
      day.opened = true;
      this.days.set([...this.days()]);
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

  private getContentForDay(day: number): string {
    const messages = [
      '🎄 Joy to the world!',
      '⭐ Shine bright!',
      '🎁 A gift for you!',
      '❄️ Let it snow!',
      '🕯️ Light the way',
      '🔔 Jingle bells!',
      '🎅 Ho ho ho!',
      '🤶 Merry & bright',
      '🦌 Reindeer magic',
      '⛄ Frosty greetings',
      '🎶 Carol time!',
      '🌟 Starry night',
      '🎊 Celebrate!',
      '🍪 Cookie time!',
      '🥛 Milk & cookies',
      '🎀 Wrapped with love',
      '🏠 Home sweet home',
      '❤️ Love & peace',
      '✨ Magic moments',
      '🎵 Silent night',
      '🌙 Moonlit wonder',
      '🎺 Herald angels',
      '🕊️ Peace on Earth',
      '🎉 Christmas Eve!'
    ];
    return messages[day - 1] || '🎄 Merry Christmas!';
  }
}
