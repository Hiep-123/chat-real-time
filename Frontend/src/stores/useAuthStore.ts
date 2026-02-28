import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "../services/authService";
import type { AuthState } from "@/types/store";
import { persist } from "zustand/middleware";
import { useChatStore } from "./useChatStore";

export const useAuthStore = create<AuthState>()(
    persist((set, get) => ({
        accessToken: null,
        user: null,
        loading: false,

        clearState: () => {
            set({ accessToken: null, user: null, loading: false })
            useChatStore.getState().reset()
            localStorage.clear()//clear thong tin cua user cu khi dnag nhap cung 1 may 
            sessionStorage.clear()
        },
        setAccessToken: (accessToken) => {
            set({ accessToken });
        },
        signUp: async (username, password, email, firstname, lastname) => {
            try {
                
                set({ loading: true });
                //goi api
                await authService.signUp(username, password, email, firstname, lastname);
                toast.success("Đăng ký thành công! Vui lòng đăng nhập");
            } catch (error) {
                console.log("Đăng ký thất bại", error);
                toast.error("Đăng ký thất bại. Vui lòng thử lại.");
            } finally {
                set({ loading: false });
            }
        },
        signIn: async (username, password) => {
            try {
                get().clearState()
                set({ loading: true });
                localStorage.clear()
                useChatStore.getState().reset()
                //goi api
                const { accessToken } = await authService.signIn(username, password);
                get().setAccessToken(accessToken);
                await get().fetchMe();
                useChatStore.getState().fetchConversation()
                toast.success("Đăng nhập thành công!");
            } catch (error) {
                console.log("Đăng nhập thất bại", error);
                toast.error("Đăng nhập thất bại.");
            } finally {
                set({ loading: false });
            }
        },
        signOut: async () => {
            try {
                get().clearState();
                await authService.signOut();
                toast.success("Logout thành công!");
            } catch (error) {
                console.error(error);
                toast.error("Lỗi xảy ra khi logout. Hãy thử lại!");
            }
        },
        fetchMe: async () => {
            try {
                set({ loading: true });
                const user = await authService.fetchMe();
                set({ user });
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
                set({ user: null, accessToken: null });
            } finally {
                set({ loading: false });
            }
        },
        refresh: async () => {
            try {
                set({ loading: true });
                const { user, fetchMe, setAccessToken } = get();
                const accessToken = await authService.refresh();
                setAccessToken(accessToken);

                if (!user) {
                    await fetchMe();
                }
            } catch (error) {
                console.error("Lỗi khi làm mới token:", error);
                toast.error("Phiên đã hết hạn. Vui lòng đăng nhập lại.");
                get().clearState();
            } finally {
                set({ loading: false });
            }
        }
    }), {
        name: "auth-storage",
        partialize: (state) => ({ user: state.user })
    })
);