import { create } from "zustand";
import { createAuthSlice } from "./slices/auth-slice";
import { createChatSlice } from "./slices/chat-slice";
import { createSocialSlice } from "./slices/social-slice";

export const useAppStore = create()((...a)=> ({
  ...createAuthSlice(...a),
  ...createChatSlice(...a),
  ...createSocialSlice(...a),
}));