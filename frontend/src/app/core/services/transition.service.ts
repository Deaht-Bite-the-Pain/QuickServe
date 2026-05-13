import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransitionService {
  private isVisible = new BehaviorSubject<boolean>(false);
  isVisible$ = this.isVisible.asObservable();

  private animationFinishedResolve: (() => void) | null = null;
  private isPlaying = false;

  async playTransition(): Promise<boolean> {
    if (this.isPlaying) return true; // Prevent overlapping transitions

    this.isPlaying = true;
    this.isVisible.next(true);

    await new Promise<void>(resolve => {
      this.animationFinishedResolve = resolve;
    });

    this.isPlaying = false;
    return true; // Unblocks the Router
  }

  hide() {
    this.isVisible.next(false);
    if (this.animationFinishedResolve) {
      this.animationFinishedResolve();
      this.animationFinishedResolve = null;
    }
  }
}
