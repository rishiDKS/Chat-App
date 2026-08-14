import { create } from "zustand";

const useAuthStore = create((set) => ({
    authUser: { name: "john", _id: 123, age: 25 },
    isLoggedIn: false,
    isLoading: false,

    login: () => {
        console.log("We just Logged in");
        set({ isLoggedIn: true, isLoading: true });
    },
}));

export default useAuthStore;