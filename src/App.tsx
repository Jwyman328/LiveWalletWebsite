import React from "react";
import "./App.css";

import "@mantine/core/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";

import { Home } from "./pages/Home";
import { QueryClient, QueryClientProvider } from "react-query";

import { createHashRouter, RouterProvider, Outlet } from "react-router-dom";
import { Header } from "./pages/Header";
import { Download } from "./pages/Download";
import Playground from "./pages/Playground";
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
      {
        path: "sandbox", // sandbox route
        element: <Playground />,
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
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <RouterProvider router={router}></RouterProvider>
      </MantineProvider>
    </QueryClientProvider>
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
