<template>
    <Preload v-if="!structureTable.length" class="preload" />

    <form @submit.prevent="submitForm" v-else-if="chosenNameTable == 'system_attributes'"
        class="create-row__form create-row__form-aos">
        <div v-for="(row, rowIndex) in forms" :key="rowIndex" class="create-row__row create-row__row-system-attr">
            <div v-for="(field, id) in filterStructureTable" :key="id" class="create-row__wrap create-row__inputs">
                <div class="create-row__wrap-system-attr" v-if="field.Field === 'system_id'">
                    <label class="create-row__form-title">
                        Система:
                    </label>
                    <select class="create-row__form-select" v-model="row[field.Field]">
                        <option class="create-row__option" v-for="system in filterSystem" :key="system.id"
                            :value="system.id">{{
                                system.name }}
                        </option>
                    </select>
                </div>
                <div class="create-row__wrap-system-attr" v-if="field.Field === 'name'">
                    <label class="create-row__attr-title">{{ field.Field === "name" ? "Название атрибута" : field.Field
                        }}: </label>
                    <input v-model="row[field.Field]" class="create-row__input" placeholder="Введите название" />
                </div>
                <div class="create-row__wrap-system-attr" v-if="field.Field === 'value'">
                    <span class="create-row__attr-title">{{ field.Field === "value" ? "Значение атрибута" : field.Field
                        }}: </span>
                    <textarea v-model="row[field.Field]" type="text" class="create-row__input create-row__input_text"
                        placeholder="Введите данные"></textarea>
                </div>
            </div>
            <button v-if="forms.length > 1" @click.prevent="removeRow(rowIndex)"
                class="create-row__btn create-row__btn_remove">
                ✖
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
        chosenNameTable: {
            type: String
        },
        structureTable: {
            type: Array,
            required: true
        },
        token: {
            type: String
        },
        systems: {
            type: Array,
            required: true
        },
    },
    data() {
        return {
            forms: [],
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
        }, removeRow(index) {
            this.forms.splice(index, 1);
        },
        submitForm() {
            this.$emit('submitForm', this.forms);
        },
        getFormData() {
            return this.forms;
        }
    },
    computed: {
        filterStructureTable() {
            return this.structureTable ? this.structureTable.filter(field => field.Field !== 'id') : [];
        },
        filterSystem() {
            return this.systems.sort((a, b) => a.id - b.id);
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
}
</script>

<style>
.create-row__wrap-system-attr {
    display: flex;
    align-items: center;
}

.create-row__input_text {
    height: 100px;
}
</style>
