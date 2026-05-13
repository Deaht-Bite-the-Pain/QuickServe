import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { TransitionService } from '../../../core/services/transition.service';
import { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-transition-overlay',
  standalone: true,
  imports: [CommonModule, LottieComponent],
  template: `
    <div 
      *ngIf="isVisible$ | async" 
      class="transition-overlay"
      [class.fade-in]="isVisible$ | async"
    >
      <div class="animation-container">
        <ng-lottie 
          [options]="options" 
          width="400px" 
          height="400px"
          (complete)="animationComplete()"
          (animationCreated)="animationCreated($event)"
          (error)="animationError($event)">
        </ng-lottie>
      </div>
      <div class="loading-bar-container">
        <div class="loading-bar"></div>
      </div>
    </div>
  `,
  styles: [`
    .transition-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #0f0f0f;
      pointer-events: all;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      transition: opacity 0.5s ease-in-out;
    }

    .animation-container {
      width: 400px;
      height: 400px;
    }

    .loading-bar-container {
      width: 250px;
      height: 6px;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      overflow: hidden;
      margin-top: -20px; /* Bring it slightly closer to the animation */
    }

    .loading-bar {
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #ff6b6b, #feca57, #ff6b6b);
      background-size: 200% 100%;
      border-radius: 10px;
      animation: loading 1.5s infinite linear;
      transform-origin: left;
    }

    .fade-in {
      animation: fadeIn 0.3s forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes loading {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `]
})
export class TransitionOverlayComponent {
  private transitionService = inject(TransitionService);
  isVisible$ = this.transitionService.isVisible$;

  options: AnimationOptions = {
    path: 'assets/animations/transition.json',
    autoplay: true,
    loop: false
  };

  animationComplete(): void {
    // Hide automatically when the animation finishes
    this.transitionService.hide();
  }

  animationCreated(_animationItem: AnimationItem): void {}

  animationError(error: any): void {
    console.error('Error loading Lottie animation.', error);
    this.transitionService.hide(); // Failsafe to unblock routing
  }
}
