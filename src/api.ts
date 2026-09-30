import type { Backend } from "@chat/chat-back";
import { hc } from "hono/client";
import { BACKEND_URL } from "./consts.ts";

export const api = hc<Backend>(BACKEND_URL);
