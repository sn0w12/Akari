import { StartClient, hydrateRoot } from "@tanstack/react-start";
import { createRouter } from "./router";

const router = createRouter();

hydrateRoot(document, <StartClient router={router} />);
