export const createAuthSlice = (set) => ({
  userInfo: undefined, 
  setUserInfo: (userinfo) => set({ userInfo: userinfo }), 
});
