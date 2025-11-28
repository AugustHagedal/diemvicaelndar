import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.html',
  styleUrl: './popup.scss'
})
export class Popup {
  day = input.required<number>();
  text = input.required<string>();
  imageUrl = input<string>('');
  weekday = input.required<string>();
  
  close = output<void>();
  
  onClose(): void {
    this.close.emit();
  }
}
