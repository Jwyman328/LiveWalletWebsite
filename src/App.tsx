import React from "react";
import "./App.css";

import "@mantine/core/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";

import { Home } from "./pages/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./pages/Header";
import { Download } from "./pages/Download";

const queryClient = new QueryClient();

const theme = createTheme({
  /** Put your mantine theme override here */
});

function Main() {
  return (
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/download" element={<Download />} />
          </Routes>
        </Router>
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
