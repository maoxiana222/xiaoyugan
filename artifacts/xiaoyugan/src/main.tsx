import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const defaultProdApiBaseUrl = "https://workspaceapi-server-production-a72b.up.railway.app";
const apiBaseUrl =
  envBaseUrl && envBaseUrl.length > 0
    ? envBaseUrl
    : import.meta.env.PROD
      ? defaultProdApiBaseUrl
      : null;

setBaseUrl(apiBaseUrl);

createRoot(document.getElementById("root")!).render(<App />);
