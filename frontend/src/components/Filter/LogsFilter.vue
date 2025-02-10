<template>
    <div class="table__filter-content">
        <div class="table__filter-item">
            <span class="table__filter-title">Выберете вид лога: </span>
            <select class="table__filter-select" v-model="filters.location">
                <option class="table__filter-options" value="INTERFACE">INTERFACE</option>
                <option class="table__filter-options" value="MODUL">MODUL</option>
            </select>
        </div>
        <div class="table__filter-item">
            <span class="table__filter-title">Выберете действие: </span>
            <select class="table__filter-select" v-model="filters.action">
                <option class="table__filter-options" value="CREATE">CREATE</option>
                <option class="table__filter-options" value="UPDATE">UPDATE</option>
                <option class="table__filter-options" value="DELETE">DELETE</option>
            </select>
        </div>
        <div class="table__filter-item">
            <span class="table__filter-title">Выберете статус: </span>
            <select class="table__filter-select" v-model="filters.status">
                <option class="table__filter-options" value="good">good</option>
                <option class="table__filter-options" value="waste">waste</option>
                <option class="table__filter-options" value="error">error</option>
            </select>
        </div>
    </div>
</template>

<script>
export default {
    emits: ['applyFilters', 'updateFilteredLogs', 'resetFilters'],
    inject:['localData'],
    data() {
        return {
            filters: {
                location: "",
                action: "",
                status: ""
            },
        };
    },
    methods: {
        // Метод для применения фильтров
        applyFilters() {
            const filteredLogs = this.logs.filter(log => {
                return (
                    (this.filters.location === "" || log.location === this.filters.location) &&
                    (this.filters.action === "" || log.action === this.filters.action) &&
                    (this.filters.status === "" || log.status === this.filters.status)
                );
            });

            this.$emit("updateFilteredLogs", filteredLogs);
        },
        // Метод для сброса фильтров
        resetFilters() {
            this.filters = {
                location: "",
                action: "",
                status: ""
            };
            this.applyFilters();
        }
    }
};
</script>

<style></style>
