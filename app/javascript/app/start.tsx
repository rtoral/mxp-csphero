import { createRoot } from "react-dom/client";
import App from "../app/App";

import "./styles/index.scss";

export const start = () => {
  const container = document.getElementById("root");

  if (!container) {
    console.log("No root element found: #root");
  } else {
    // create a root
    const root = createRoot(container);

    //render app to root
    root.render(<App />);
  }
};
