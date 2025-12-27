import { defineStore } from "pinia";
import { loginApi } from "@/api/user";
import { setMonitorUserId } from "@/monitor";

interface LoginParams {
    username: string;
    password: string
}

export const useUserStore = defineStore("user", {
    state: () => ({
        token: sessionStorage.getItem("token") || "",
        roles: sessionStorage.getItem("roles") ? JSON.parse(sessionStorage.getItem("roles")!) : [],
        username: sessionStorage.getItem("username") || "",
        userId: sessionStorage.getItem("userId") || "",
        menu: sessionStorage.getItem("menu") ? JSON.parse(sessionStorage.getItem("menu")!) : [],
    }),
    actions: {
        async login(data: LoginParams) {
            try {
                // 登录前清除旧数据，确保获取最新菜单
                sessionStorage.clear();

                const { data: { token, user: { id, username, roles }, menulist } } = await loginApi(data);
                this.token = token
                this.roles = roles
                this.menu = menulist
                this.username = username;
                this.userId = String(id);
                sessionStorage.setItem("token", token)
                sessionStorage.setItem("roles", JSON.stringify(roles))
                sessionStorage.setItem("username", username)
                sessionStorage.setItem("userId", String(id))
                sessionStorage.setItem("menu", JSON.stringify(menulist))

                // 设置监控SDK的用户ID
                setMonitorUserId(String(id));
            } catch (error) {

            }
        },
        logout() {
            this.token=""
            this.roles=[];
            this.username=""
            this.userId=""
            this.menu=[];
            sessionStorage.clear()

        }
    }
})