import "zone.js";

import { bootstrapApplication } from "@angular/platform-browser";

import { AppComponent } from "./app/core/app-shell.component";
import { appConfig } from "./app/app.config";

bootstrapApplication(AppComponent, appConfig).catch((error: unknown) => {
  console.error(error);
});
