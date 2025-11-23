import { create } from "zustand";


export const useAuthStore = create((set) => ({
    authUser: { name: "jhon", _id: 123, age: 25 },
    isLoggedin: false,
    isLoading: false,

    login: () => {
        set({ isLoggedin: true, isLoading: true })
    }
}))

