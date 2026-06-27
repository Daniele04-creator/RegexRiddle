import { RouterProvider } from "react-router";

import { createAppRouter } from "@/app/router";

const router = createAppRouter();

export function App() {
  return <RouterProvider router={router} />;
}
