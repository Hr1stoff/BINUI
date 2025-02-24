<template>
    <div class="table__filter-content">
        <!-- Фильтр по виду лога (location) -->
        <div class="table__filter-item">
            <label v-for="loc in availableLocations" :key="loc" class="checkbox-wrapper-2">
                <input type="checkbox" class="custom-checkbox" v-model="filters.location[loc]" />
                {{ loc }}
            </label>
        </div>

        <!-- Фильтр по действию (action) -->
        <div class="table__filter-item">
            <label v-for="act in availableActions" :key="act" class="checkbox-wrapper-2">
                <input type="checkbox" class="custom-checkbox" v-model="filters.action[act]" />
                {{ act }}
            </label>
        </div>

        <!-- Фильтр по статусу (status) -->
        <div class="table__filter-item">
            <label v-for="stat in availableStatuses" :key="stat" class="checkbox-wrapper-2">
                <input type="checkbox" class="custom-checkbox" v-model="filters.status[stat]" />
                {{ stat }}
            </label>
        </div>
    </div>
</template>

<script>
import { toRaw } from "vue";
export default {
    emits: ['updateFilteredLogs'],

    props: {
        typeColumns: {
            type: Array, required: true
        }, data: {
            type: Array, required: true
        }
    },
    data() {
        return {
            filters: {
                location: {},
                action: {},
                status: {}
            }
        };
    },
    computed: {
        availableLocations() {
            return ["INTERFACE", "MODULE"];
        },
        availableActions() {
            return ["CREATE", "UPDATE", "DELETE"];
        },
        availableStatuses() {
            return ["GOOD", "WASTE", "ERROR"];
        }
    },
    watch: {

        filters: {
            deep: true,
            handler() {
                this.applyFilters();
            }
        }
    },
    methods: {
        applyFilters() {
            const rawLogs = toRaw(this.data);
            if (!Array.isArray(this.data)) {
                console.error("Ошибка: this.logs не массив!", this.data);
                return;
            }
            const filteredLogs = rawLogs.filter(log => {
                return (
                    (this.selectedFilters(this.filters.location).length === 0 || this.selectedFilters(this.filters.location).includes(log.location)) &&
                    (this.selectedFilters(this.filters.action).length === 0 || this.selectedFilters(this.filters.action).includes(log.action)) &&
                    (this.selectedFilters(this.filters.status).length === 0 || this.selectedFilters(this.filters.status).includes(log.status))
                );
            });

            console.log("✅ Отфильтрованные логи:", filteredLogs);
            this.$emit("updateFilteredLogs", filteredLogs);
        },
        selectedFilters(filterGroup) {
            return Object.keys(filterGroup).filter(key => filterGroup[key]);
        },
        resetFilters() {
            this.filters = {
                location: {},
                action: {},
                status: {}
            };
            this.applyFilters();
        }

    }
};
</script>

<style>
.checkbox-wrapper-2 {
    display: flex;
    gap: 10px;
    align-items: center;

    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
    font-size: 20px;
}

/* Стилизация кастомного чекбокса */
.checkbox-wrapper-2 .custom-checkbox {
    appearance: none;
    background-color: #dfe1e4;
    border-radius: 72px;
    border: 1px #ccc solid;
    flex-shrink: 0;
    height: 22px;
    margin: 0 8px 0 0;
    position: relative;
    width: 40px;
    cursor: pointer;
}

.checkbox-wrapper-2 .custom-checkbox::before {
    bottom: -6px;
    content: "";
    left: -6px;
    position: absolute;
    right: -6px;
    top: -6px;
}

.checkbox-wrapper-2 .custom-checkbox,
.checkbox-wrapper-2 .custom-checkbox::after {
    transition: all 100ms ease-out;
}

.checkbox-wrapper-2 .custom-checkbox::after {
    background-color: #fff;
    border-radius: 50%;
    content: "";
    height: 20px;
    left: 1px;
    position: absolute;
    top: 0px;
    width: 20px;
}

.checkbox-wrapper-2 input[type=checkbox] {
    cursor: pointer;
}

.checkbox-wrapper-2 .custom-checkbox:hover {
    background-color: #c9cbcd;
    transition-duration: 0s;
}

.checkbox-wrapper-2 .custom-checkbox:checked {
    background-color: #6506EF;
}

.checkbox-wrapper-2 .custom-checkbox:checked::after {
    background-color: #fff;
    left: 18px;
}

.checkbox-wrapper-2 :focus:not(.focus-visible) {
    outline: 0;
}

.checkbox-wrapper-2 .custom-checkbox:checked:hover {
    background-color: #6506EF;
}
</style>