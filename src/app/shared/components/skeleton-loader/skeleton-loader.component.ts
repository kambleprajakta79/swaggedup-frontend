import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
})
export class SkeletonLoaderComponent {
  @Input() type: 'grid' | 'card' | 'list' = 'grid';
  @Input() count = 4;

  get arrayFromCount(): number[] {
    return Array(this.count).fill(0);
  }
}
