<template>
    <div class="table__filter">
        <button class="table__filter-btn" @click="show = !show">Фильтр</button>

        <div class="table__filter-wrap" v-if="show">
            <LogsFilter ref="logsFilter" v-if="selectedTable == 'logs'" @getUpdateFilter="updateFilteredLogs"
                @resetFilters="resetFilters" :typeColumns="typeColumns" :data="data" />

            <div class="table__filter-error" v-if="errorOpen">
                {{ message }}
            </div>
            <div class="table__filter-buttons">
                <button v-if="!selectedTable == 'logs'" class="table__filter-btn"
                    @click="applyFilters">Применить</button>
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
        data:{
            type: Array,
            required: true
        },

        headers: {
            type: Array,
            required: true
        },
        selectedTable: {
            type: String
        },
        token: {
            type: String
        },
    },
    components: {
        LogsFilter
    },
    data() {
        return {
            typeColumns: [],
            show: false,
            errorOpen: false,
            message: '',
            filteredLogs: this.data,
        }
    },
    mounted() {
        this.getColumns()
    },
    methods: {
        applyFilters() {
            this.$refs.logsFilter.applyFilters();
        },
        // Сбросить фильтры
        resetFilters() {
            this.$refs.logsFilter.resetFilters();
        },
        // Получаем отфильтрованные данные и обновляем
        updateFilteredLogs(filteredLogs) {
            this.filteredLogs = filteredLogs;
            this.$emit("filteredLogsUpdated", filteredLogs);
        },
        async getColumns() {
            try {
                const response = await api.get('/tables/typeTable', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    },
                    params: {
                        nameTable: this.selectedTable
                    }
                });
                this.typeColumns = response.data.columns;
        
            }
            catch (err) {
                this.handleError(err, 'Ошибка в получении полей таблицы');
            }
        },
    }
}
</script>

<style>
.table__filter-btn {
    padding: 15px 15px;
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

.table__filter-btn:hover {
    color: #0A04A9;
    background-color: #fff;
    border-color: #ccc;
}

.table__filter-wrap {
    transition: 0.2s linear;
    position: absolute;
    background-color: #fff;
    border-radius: 11px;
    padding: 15px;
    margin-top: 10px;
    border: 1px solid #ccc;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.table__filter-content {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 10px;
}

.table__filter-item {
    display: flex;
    gap: 15px;
}

.table__filter-title {
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
    font-size: 20px;
    color: #0A04A9;
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