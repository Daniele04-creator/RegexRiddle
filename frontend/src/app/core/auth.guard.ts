import { inject } from "@angular/core";
import { type CanActivateFn, Router, type UrlTree } from "@angular/router";

import { AuthService } from "./auth.service";

export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(AuthService).user() !== null) {
    return true;
  }

  return loginRedirect(inject(Router), state.url);
};

export function loginRedirect(router: Router, returnUrl: string): UrlTree {
  return router.createUrlTree(["/login"], {
    queryParams: { returnUrl }
  });
}
