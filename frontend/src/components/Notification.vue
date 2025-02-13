<template>
    <Transition name="fade">
        <div v-if="visible" :class="['notification', type]" @click="closeNotification">
            <div class="notification__wrap">
                <slot>{{ message }}</slot>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { ref, watchEffect } from 'vue';

const props = defineProps({
    message: String,
    type: {
        type: String,
        default: 'info', // Возможные варианты: 'success', 'error', 'warning', 'info'
    },
    duration: {
        type: Number,
        default: 3000,
    },
});

const visible = ref(true);

const closeNotification = () => {
    visible.value = false;
};

watchEffect(() => {
    if (props.duration > 0) {
        setTimeout(closeNotification, props.duration);
    }
});
</script>

<style scoped>
.notification {
    padding: 15px;
    border-radius: 5%;
    color: white;
    font-weight: bold;
    position: fixed;
    top: 20px;
    right: 20px;
    min-width: 200px;
    text-align: center;
    cursor: pointer;
    z-index: 1002;
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
    font-size: 24px;

}

.success {
    background-color: #0077AA;
}

.error {
    background-color: #CC3333;
}

.warning {
    background-color: #FF6600;
}

.info {
    background-color: #FCFBFC;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>