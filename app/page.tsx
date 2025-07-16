"use client";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Index";
import AllComponents from "@/pages/NotFound";

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/components",
      element: <AllComponents />,
    },
  ]);

  return <RouterProvider router={router} />;
}