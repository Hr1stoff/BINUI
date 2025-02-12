<template>
    <div class="table__filter">
        <button class="table__filter-btn" @click="show = !show">Фильтр</button>

        <div class="table__filter-wrap" v-if="show">
            <LogsFilter ref="logsFilter" v-if="selectedTable == 'logs'" @getUpdateFilter="updateFilteredLogs" @applyFilters="applyFilters" @resetFilters="resetFilters" />

            <div class="table__filter-error" v-if="errorOpen">
                {{ message }}
            </div>
            <div class="table__filter-buttons">
                <button class="table__filter-btn" @click="applyFilters">Применить</button>
                <button class="table__filter-btn reset" @click="resetFilters">Сбросить</button>
            </div>
        </div>

    </div>
</template>

<script>
import LogsFilter from '@/components/Filter/LogsFilter.vue';
import api from '@/services/api';
export default {
    props: {
        headers: {
            type: Array,
            required: true
        },
        selectedTable: {
            type: String
        },
    },
    components: {
        LogsFilter
    },
    data() {
        return {
            token: localStorage.getItem('token'),
            show: false,
            typeTable: [],
            errorOpen: false,
            message: '',
            filteredLogs: []
        }
    },
    methods: {
        applyFilters() {            
            this.$refs.logsFilter.applyFilters();
        },

        resetFilters() {
            this.$refs.logsFilter.resetFilters();
        },

        updateFilteredLogs(filteredLogs) {
            console.log(filteredLogs);
            this.filteredLogs = filteredLogs;
        }
    }
}
</script>

<style>
.table__filter-btn {
    display: block;
    padding: 0 10px;
    /* width: 100px; */
    height: 35px;
    background-color: #0099CC;
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
    font-size: 16px;
    color: #fff;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.3);
}

.table__filter-btn:hover {
    background-color: #0077AA;
    transition: 0.3s;
}

.table__filter-wrap {
    transition: 0.2s linear;
    position: absolute;
    width: 500px;
    height: 300px;
    background-color: #fff;
    border-radius: 5px;
    padding: 15px;
    margin-top: 10px;
    border: 1px solid #ccc;

    display: flex;
    flex-direction: column;
    gap: 10px;
}

.table__filter-content {

    display: flex;
    flex-direction: column;
    background-color: #A7CEA7;
    border-radius: 10px;
}

.table__filter-item {
    padding: 10px;
    display: flex;
    gap: 15px;
}

.table__filter-title {
    display: block;
    width: 250px;
    font-family: 'Open Sans', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #fff;
}

.table__filter-select {
    font-family: 'Open Sans', sans-serif;
    font-weight: 200;
    font-size: 20px;
    width: 100%;
    height: 35px;
    background-color: #fff;
}

.table__filter-options {}

.table__filter-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.table__filter-btn {}
</style>