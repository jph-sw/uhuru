import { createServerFn } from "@tanstack/react-start";

export const createSite = createServerFn({ method: "POST" }).handler();
