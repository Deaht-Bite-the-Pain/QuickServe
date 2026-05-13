import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TransitionOverlayComponent } from './shared/components/transition-overlay/transition-overlay.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TransitionOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
