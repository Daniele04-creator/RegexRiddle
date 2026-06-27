import { render } from "@testing-library/react";
import { RouterProvider } from "react-router";

import { Providers } from "@/app/providers";
import { createTestRouter } from "@/app/router";

export function renderRoute(path = "/") {
  return render(
    <Providers>
      <RouterProvider router={createTestRouter([path])} />
    </Providers>
  );
}
