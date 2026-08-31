import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) {
    const id = this.nextId++;
    const newToast: Toast = { id, type, message };
    
    this.toastsSubject.next([...this.toastsSubject.value, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, duration = 3500) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 4000) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 3000) {
    this.show(message, 'info', duration);
  }

  remove(id: number) {
    this.toastsSubject.next(this.toastsSubject.value.filter((t) => t.id !== id));
  }
}
