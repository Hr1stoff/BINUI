<template>
    <div class="preloader" v-if="isLoading">
        <Preload />
    </div>
    <div v-else>
        <Header :tables="tables" @tableSelected="getSelectedTable" />
        <Table :data="dataTable" :headers="headers" :selectedTable="selectedTable" @deleteRow="handleDeleteRow"
            :allSystems="allSystems" />
    </div>
</template>

<script>
import Preload from '@/components/Preload.vue';
import Header from '@/components/Header.vue';
import Table from '@/views/Table.vue';
import api from '@/services/api';

export default {
    data() {
        return {
            tables: [],
            headers: [],
            dataTable: [],
            selectedTable: '',
            token: localStorage.getItem('accessToken'),
            isLoading: localStorage.getItem('isLoading'),
            allSystems: []
        };
    },
    async beforeRouteEnter(to, from, next) {
        next((vm) => vm.loadData());
    },
    created() {
        this.getTables();
        this.getSystems();
        if (!this.tables.length && !this.selectedTable.length && !this.dataTable.length) {
            this.loadData();
        }
    },
    components: {
        Header,
        Table,
        Preload
    },
    methods: {
        async getTables() {
            try {
                const response = await api.get('/tables/getAllTable', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                });
                this.tables = response.data.tables;
            } catch (err) {
                this.handleError(err, 'Ошибка при получении списка таблиц');
            }
        },
        getSelectedTable(table) {
            this.selectedTable = table;
            this.getTableData();
        },
        handleDeleteRow(id) {
            console.log('Удаление', id);

        },
        async getTableData() {
            try {
                const response = await api.get('/tables/getTable', {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                    params: { table: this.selectedTable },
                });
                this.dataTable = response.data.table;

                if (this.dataTable.length > 0) {
                    this.headers = Object.keys(this.dataTable[0]);
                }
            } catch (err) {
                this.handleError(err, 'Ошибка при получении данных таблицы');
            }
        },

        handleError(err, defaultMessage) {
            console.error(defaultMessage, err.response?.data || err.message);
            this.error = `${defaultMessage}: ${err.response?.data?.message || err.message}`;
        },
        async loadData() {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
            } finally {
                this.isLoading = false;
            }
        },
        async getSystems() {
            try {
                const response = await api.get('/tables/getSystems', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }

                });
                const result = response.data.result
                this.allSystems = result.map(system => system.name);
            }
            catch (err) {
                this.handleError(err, 'Ошибка при получении списка таблиц');
            }
        }
    },
};
</script>

<style>
.preloader {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
}
</style>