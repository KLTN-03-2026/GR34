import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { Toaster } from "react-hot-toast";
import "@fortawesome/fontawesome-free/css/all.min.css";

AOS.init({ duration: 800, once: false });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            zIndex: 99999,
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
