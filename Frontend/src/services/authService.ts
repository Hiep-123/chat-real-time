import apiClient from "@/lib/axios";

export const authService = {
    signUp: async (
        username: string,
        password: string,
        email: string,
        firstname: string,
        lastname: string) => {
        const res = await apiClient.post("/auth/signup", {
            username,
            password,
            email,
            firstname,
            lastname
        }, { withCredentials: true });
        return res.data;
    },

    signIn: async (
        username: string,
        password: string
    ) => {
        try {
            const res = await apiClient.post("/auth/signin", {
                username,
                password
            }, { withCredentials: true });
            return res.data;//accessToken
        } catch (error) {
            console.log("Lỗi đăng nhập:", error);
        }
    },
    signOut: async () => {
        return apiClient.post("/auth/signout", { withCredentials: true });
    },
    fetchMe: async () => {
        const res = await apiClient.get("/user/me", { withCredentials: true });
        return res.data.user;
    },
    refresh: async () => {
        const res = await apiClient.post("/auth/refresh", { withCredentials: true });
        return res.data.accessToken;
    }
}