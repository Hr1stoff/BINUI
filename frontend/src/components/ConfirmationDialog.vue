<template>
    <div class="ConfirmationDialog">
        <div class="ConfirmationDialog__wrapper">
            <div class="ConfirmationDialog__content">
                <h1 class="ConfirmationDialog__title">
                    {{ title }}
                </h1>
                <span class="ConfirmationDialog__message">{{ message }}</span>
            </div>
            <div class="ConfirmationDialog__buttons">
                <button class="ConfirmationDialog__btn ConfirmationDialog__btn_confirm"
                    @click="confirmAction">Ок</button>
                <button class="ConfirmationDialog__btn ConfirmationDialog__btn_close"
                    @click="$emit('closeConfirmWindow')">Отмена</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String
        },
        message: {
            type: String,
        }
    },
    data() {
        return {

        }
    },
    emits: ['closeConfirmWindow', 'confirmAction'],
    methods: {
        confirmAction() {
            this.$emit('confirmAction');
        }
    }
}
</script>

<style>
.ConfirmationDialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.ConfirmationDialog__wrapper {
    height: 200px;
    background-color: #fff;
    border-radius: 11px;
    padding: 20px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    /* align-items: center; */
}

.ConfirmationDialog__content {
    display: flex;
    flex-direction: column;
    text-align: left;
}

.ConfirmationDialog__title {
    font-family: 'Open Sans', sans-serif;
    font-size: 32px;
    font-weight: 700;
}

.ConfirmationDialog__message {
    display: block;
    font-family: 'Open Sans', sans-serif;
    font-size: 20px;
    font-weight: 400;
    padding: 15px 0;
}

.ConfirmationDialog__buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

.ConfirmationDialog__btn {
    padding: 10px 9px;
    display: block;
    color: #fff;
    background-color: #6506EF;
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
    font-size: 16px;
    border-radius: 10px;
    border: 1px solid transparent;
    transition: 0.2s linear;
}
.ConfirmationDialog__btn_confirm{
    border: 1px solid #ccc;
}
.ConfirmationDialog__btn_confirm:hover {
    color: #0A04A9;
    background-color: #fff;
    transition: 0.3s;
}

.ConfirmationDialog__btn_close:hover {
    background-color: #D9262A;
    transition: 0.1s linear;
    border: 1px solid #ccc;
    color: #fff;
}
</style>