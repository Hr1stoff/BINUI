<template>
    <div class="login">
        <div class="login__wrapper">
            <div class="login__title">
                <h1 class="login__name">Вход в базу System Access</h1>
            </div>
            <form class="login__form" @submit.prevent="handleLogin">
                <div class="login__input">
                    <label for="login_input-host">Хост:</label>
                    <input id="login_input-host" v-model="form.host" type="text" class="login__input-host"
                        placeholder="Введите хост" />
                </div>
                <div class="login__input">
                    <label for="login_input-login">Логин:</label>
                    <input id="login_input-login" v-model="form.user" type="text" class="login__input-login"
                        placeholder="Введите логин" />
                </div>
                <div class="login__input">
                    <label for="login_input-password">Пароль:</label>
                    <input id="login_input-password" v-model="form.password" type="password"
                        class="login__input-password" placeholder="Введите пароль" />
                </div>
                <div class="login__post">
                    <button type="submit" class="login__btn" :disabled="isLoading">
                        {{ isLoading ? 'Загрузка...' : 'Вход' }}
                    </button>
                </div>
                <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            </form>
        </div>
    </div>
</template>

<script>
import api from "@/services/api";
import AuthService from "@/services/authService";


export default {
    data() {
        return {
            form: {
                host: "",
                user: "",
                password: "",
            },
            errorMessage: '',
            isLoading: false
        };
    }, methods: {
        async handleLogin() {
            this.errorMessage = "";
            this.isLoading = true;

            try {
                const response = await AuthService.login({
                    host: this.form.host,
                    login: this.form.user,
                    password: this.form.password,
                });

                this.$router.push("/cabinet");
            } catch (error) {
                console.error("Ошибка авторизации:", error);
                this.errorMessage =
                    error.response?.data?.message || "Ошибка авторизации. Попробуйте снова.";
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style>
.login {
    margin: 100px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.login__wrapper {
    width: 500px;
    height: 600px;
    background-color: #A7CEA7;
    padding: 106px 95px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 5%;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.3);
}

.login__title {
    margin: 16px 0;
    display: flex;
    justify-content: center;
}

.login__name {
    width: 230px;
    font-family: 'Open Sans', sans-serif;
    font-weight: bold;
    font-size: 24px;
    color: #fff;
    text-align: center;
}

.login__form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.login__input {
    height: 42px;
    background-color: #fff;
    display: flex;
    align-items: center;
    padding: 0 9px;
    font-family: 'Open Sans', sans-serif;
    font-weight: bold;
    font-size: 16px;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.3);
}

.login__input-host,
.login__input-password,
.login__input-login {
    padding: 0 5px;
    height: 32px;
}

.login__post {
    width: 100%;
    display: flex;
    justify-content: center;
}

.login__btn {
    display: block;
    width: 172px;
    height: 48px;
    color: #fff;
    background-color: #4DA2E7;
    font-family: 'Open Sans', sans-serif;
    font-weight: bold;
    font-size: 16px;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.3);
}
</style>