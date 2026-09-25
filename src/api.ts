import type { Backend } from "@chat/chat-back";
import { treaty } from "@elysia/eden";
import { BACKEND_URL } from "./consts";

export const api = treaty<Backend>(BACKEND_URL)
