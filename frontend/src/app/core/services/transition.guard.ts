import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TransitionService } from './transition.service';

export const transitionGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const transitionService = inject(TransitionService);

  // Skip the blocking animation on the very first page load (e.g. hitting F5) 
  // because the router hasn't rendered any component yet, resulting in a blank white background.
  if (!router.navigated) {
    return true;
  }

  return await transitionService.playTransition();
};
