<template>
    <div class="login">
        <div class="login__wrapper">
            <div class="login__title">
                <h1 class="login__name">Вход в Систему Управления Правами и Доступом</h1>
            </div>
            <form class="login__form" @submit.prevent="handleLogin">
                <div class="login__input">
                    <input id="login_input-host" v-model="form.host" type="text" class="login__input-host"
                        placeholder="Введите адрес" />
                </div>
                <div class="login__input">
                    <input id="login_input-login" v-model="form.user" type="text" class="login__input-login"
                        autocomplete="username" placeholder="Введите логин" />
                </div>
                <div class="login__input">
                    <input id="login_input-password" v-model="form.password" type="password"
                        autocomplete="current-password" class="login__input-password" placeholder="Введите пароль" />
                </div>
                <div class="login__post">
                    <button type="submit" class="login__btn" :disabled="isLoading">
                        {{ isLoading ? "Загрузка..." : "Вход" }}
                    </button>
                </div>
                <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            </form>
        </div>
    </div>
    <Notification v-if="activateNotification" :message="notificationMessage" :type="notificationType"
        :duration="3000" />
</template>

<script>
import AuthService from "@/services/authService";
import Notification from '@/components/Notification.vue';

export default {
    components: {
        Notification
    },
    data() {
        return {
            form: {
                host: "",
                user: "",
                password: "",
            },
            errorMessage: "",
            isLoading: false,
            activateNotification: false,
            notificationMessage: '',
            notificationType: 'info',
        };
    },
    created() {
        const savedLoadingState = localStorage.getItem("isLoading");
        this.isLoading = savedLoadingState === "true";
    },
    methods: {
        async handleLogin() {
            this.errorMessage = "";
            localStorage.setItem("isLoading", true);
            try {
                const response = await AuthService.login({
                    host: this.form.host,
                    login: this.form.user,
                    password: this.form.password,
                });
                this.$router.push("/cabinet");
            } catch (error) {
                console.error("Ошибка авторизации:", error);
                if (error.response) {
                    this.handleError(error.response.data?.message, 'Ошибка сервера. Попробуйте снова.');
                } else if (error.request) {
                    this.handleError(error.request, 'Нет ответа от сервера. Проверьте соединение.');
                } else {
                    this.handleError(error, 'Неизвестная ошибка. Попробуйте снова.');
                }
            } finally {
                this.isLoading = false;
                localStorage.setItem("isLoading", false);
            }
        }, handleError(err, message) {
            console.error(message, err);
            this.notificationMessage = message;
            this.notificationType = 'error';
            this.activateNotification = true;

            setTimeout(() => { this.activateNotification = false; }, 3000);
        },
    },
};
</script>


<style>
.login {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
}

.login__wrapper {
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    width: 500px;
    height: 600px;
    background-color: #FCFBFC;
    padding: 150px 90px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 11px;
}

.login__title {
    margin: 16px 0;
    display: flex;
    justify-content: center;
}

.login__name {
    /* width: 230px; */
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
    font-size: 24px;
    color: #0A04A9;
    text-align: center;
}

.login__form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.login__input>input:focus {
    border: 3px solid #ccc;
    transition: 0.2s linear;
}

.login__input-host,
.login__input-password,
.login__input-login {
    width: 300px;
    height: 45px;
    background-color: #fff;
    color: #0A04A9;
    display: flex;
    align-items: center;
    padding: 5px 12px;
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 10px;
}

.login__post {
    width: 100%;
    display: flex;
    justify-content: center;
}

.login__btn {
    display: block;
    width: 300px;
    height: 45px;
    color: #fff;
    background-color: #6506EF;
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
    font-size: 16px;
    border-radius: 10px;
}

.login__btn:hover {
    color: #0A04A9;
    background-color: #fff;
    transition: 0.2s linear;
    border: 2px solid #ccc;
}
</style>