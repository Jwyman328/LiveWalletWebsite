import React from "react";
import "./App.css";

import "@mantine/core/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";

import { Home } from "./pages/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  Routes,
  Route,
  createHashRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import { Header } from "./pages/Header";
import { Download } from "./pages/Download";
const Layout = () => {
  return (
    <div>
      <Header />
      <main>
        <Outlet /> {/* This is where the route components will be rendered */}
      </main>
    </div>
  );
};

const queryClient = new QueryClient();

const router = createHashRouter([
  {
    path: "/",
    element: <Layout />, // Use Layout here to wrap around routes
    children: [
      {
        path: "/", // Home route
        element: <Home />,
      },
      {
        path: "download", // Download route
        element: <Download />,
      },
      // Add more routes here as needed
    ],
  },
]);

const theme = createTheme({
  /** Put your mantine theme override here */
});

function Main() {
  return (
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}></RouterProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Main />
    </div>
  );
}

export default App;
