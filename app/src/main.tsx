import { createRoot } from "react-dom/client";
import { createRootElement } from "./root";
import "./view/index.css";

createRoot(document.getElementById("root")!).render(createRootElement());
