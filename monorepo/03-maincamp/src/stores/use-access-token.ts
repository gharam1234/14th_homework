import { create } from "zustand";

type AccessTokenStore = {
  accessToken: string;
  setAccessToken: (loginToken: string) => void;
  clearAccessToken: () => void;
};


export const useAccessTokenStore = create<AccessTokenStore>((set) => ({
  accessToken: "",
  setAccessToken: (loginToken: string) => {
    localStorage.setItem("accessToken", loginToken); 
    set({ accessToken: loginToken });
  },
  clearAccessToken: () => {
    localStorage.removeItem("accessToken"); 
    set({ accessToken: "" });
  },
}));