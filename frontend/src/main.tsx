import App from "./App";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./index.css";

const root = document.getElementById("root")!;
createRoot(root).render(<App />);
