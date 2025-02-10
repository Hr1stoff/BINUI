<template>
    <Preload v-if="!systems.length" class="preload" />
    <form v-else class="create-row__form" @submit.prevent="submitForm">
        <div class="create-row__wrap">
            <label class="create-row__form-title">
                Отдел:
            </label>
            <select class="create-row__form-select" v-model="form.department_id">
                <option class="create-row__option" v-for=" department in departments" :value="department.id"
                    :key="department.id">{{ department.name }}</option>
            </select>
        </div>
        <div class="create-row__wrap">
            <label class="create-row__form-title">
                Должность:
            </label>
            <select class="create-row__form-select" v-model="form.position_id">
                <option v-for="post in position" :value="post.id" :key="post.name">{{
                    post.name }}</option>
            </select>
        </div>
        <div class="create-row__wrap">
            <label class="create-row__form-title">
                Системы:
            </label>
            <div class="create-row__checkbox-wrapper">
                <div class="create-row__checkbox-wrap" v-for="system in systems" :key="system.id">
                    <label :for="system.name">{{ system.name }} </label>
                    <input type="checkbox" class="create-row__checkbox" :value="system.id" v-model="form.systems" />
                </div>
            </div>
        </div>
        <div class="create-row__wrap">
            <label class="create-row__form-title">Тип учётной записи: </label>
            <select class="create-row__form-select" v-model="form.user_type">
                <option v-for="(name, id) in typeUserType" :value="name" :key="id">{{ name }}</option>
            </select>
        </div>
    </form>



</template>

<script>
import api from '@/services/api';

import Preload from '@/components/Preload.vue';

export default {
    emits: ['submitForm'],
    props: {
        token: {
            type: String
        },
        departments: {
            type: Array,
            required: true
        },
        position:{
            type: Array,
            required: true
        },
        systems: {
            type: Array,
            required: true
        },
        typeUserType: {
            type: Array,
            required: true
        },

    },
    components: {
        Preload
    },
    data() {
        return {
            filteredPositions: [],
            form: {
                department_id: '',
                position_id: '',
                systems: [],
                user_type: ''
            }
        }
    },
    // watch: {
    //     async 'form.department_id'(newVal) {
    //         if (newVal) {
    //             try {
    //                 const response = await api.get(`api/access_rights/departments/${newVal}/position`, {
    //                     headers: { Authorization: `Bearer ${this.token}` }
    //                 });
    //                 this.filteredPositions = response.data.data;

    //             } catch (error) {
    //                 console.error('Ошибка при загрузке должностей:', error);
    //                 this.filteredPositions = [];
    //             }
    //         } else {
    //             this.filteredPositions = [];
    //         }
    //     }
    // },
    methods: {
        submitForm() {
            this.$emit('submitForm', this.form);
        },
        getFormData() {
            return this.form;
        }

    },
}
</script>

<style>

</style>