<template>
    <Preload v-if="!structureTable.length" class="preload" />

    <form v-else class="create-row__form create-row__form-other" @submit.prevent="submitForm">
        <div v-for="(row, rowIndex) in forms" :key="rowIndex" class="create-row__row">
            <div v-for="(field, id) in filterStructureTable" :key="id" class="create-row__wrap create-row__inputs">
                <label class="create-row__attr-title">{{ field.Field === "name" ? "Название" : field.Field }}: </label>
                <input v-model="row[field.Field]" class="create-row__input" placeholder="Введите данные" />
                
            </div>
            <button v-if="forms.length > 1" @click.prevent="removeRow(rowIndex)"
                class="create-row__btn create-row__btn_remove">
                &#65794;
            </button>
        </div>
    </form>

    <div class="create-row__button-add-row">
        <button @click="addRow" class="create-row__btn create-row__btn_add-row">+</button>
    </div>
</template>

<script>
import Preload from '@/components/Preload.vue';
import { ref, computed, watch } from 'vue';

export default {
    emits: ['submitForm'],
    components: {
        Preload
    },
    props: {
        structureTable: {
            type: Array,
            required: true
        },
        token: {
            type: String
        }
    },
    data() {
        return {
            forms: []
        };
    },
    computed: {
        filterStructureTable() {
            return this.structureTable ? this.structureTable.filter(field => field.Field !== 'id') : [];
        }
    },
    methods: {
        addRow() {
            if (!this.filterStructureTable.length) {
                console.warn("Структура таблицы ещё не загружена!");
                return;
            }
            const newRow = {};
            this.filterStructureTable.forEach(field => {
                newRow[field.Field] = "";
            });
            this.forms.push(newRow);
        },
        removeRow(index) {
            this.forms.splice(index, 1);
        },
        submitForm() {
            console.log(this.forms);
            this.$emit('submitForm', this.forms);
        },
        getFormData() {
            return this.forms;
        }
    },
    mounted() {
        watch(
            () => this.structureTable,
            (newVal) => {
                if (newVal && newVal.length && !this.forms.length) {
                    this.addRow();
                }
            },
            { immediate: true }
        );
    }
};
</script>

<style>
.preload {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 10vh;
    width: 100%;
}
</style>