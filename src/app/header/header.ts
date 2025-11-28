import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  toggleTest = output<void>();
  logout = output<void>();
  reset = output<void>();
  
  protected isMenuOpen = signal<boolean>(false);

  toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }
  
  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  onToggleTest(): void { 
    this.toggleTest.emit();
    this.closeMenu();
  }
  
  onLogout(): void { 
    this.logout.emit();
    this.closeMenu();
  }
  
  onReset(): void { 
    this.reset.emit();
    this.closeMenu();
  }
}
