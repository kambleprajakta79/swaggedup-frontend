import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  @Input() title = 'No items found';
  @Input() message = 'We could not find what you were looking for.';
  @Input() icon = '🔍'; // Emoji representation of state
  @Input() actionText = 'Go back home';
  @Input() actionLink = '/';

  @Output() actionClick = new EventEmitter<void>();

  onAction() {
    this.actionClick.emit();
  }
}
