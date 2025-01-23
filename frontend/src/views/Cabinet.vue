<template>
    <div class="preloader" v-if="isLoading">
        <Preload />
    </div>
    <div v-else>
        <Header :tables="tables" @tableSelected="getSelectedTable" @refreshData="fetchData" @openAddRow="openAddRow" />

        <Table :data="dataTable" :headers="headers" :selectedTable="selectedTable" @deleteRow="handleDeleteRow"
            :allSystems="allSystems" />
    </div>
    <AddRow v-if="showAddRow" @closeAddRowLocal="closeAddRow" :localTables="tables" :selectedTable="selectedTable"
        @getColumnsParent="getColumns" :localTypeColumns="typeColumns" @sendSelectedTable="getColumns" />


</template>

<script>
import Preload from '@/components/Preload.vue';
import Header from '@/components/Header.vue';
import Table from '@/views/Table.vue';
import AddRow from '@/components/addRow.vue';
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
            allSystems: [],
            showAddRow: false,
            typeColumns: []
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
        Preload,
        AddRow
    },
    methods: {
        async fetchData() {
            try {
                this.isLoading = true;
                await Promise.all([this.getTables(), this.getSystems()]);
                if (this.selectedTable) {
                    await this.getTableData();
                }
            } catch (err) {
                this.handleError(err, 'Ошибка при обновлении данных');
            } finally {
                this.isLoading = false;
            }
        },
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
        },
        async getColumns(nameTable) {

            try {
                const response = await api.get('/tables/getColumnsTable', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    },
                    params: {
                        nameTable: nameTable
                    }
                });
                this.typeColumns = response.data.columns;
            }
            catch (err) {
                this.handleError(err, 'Ошибка в получении полей таблицы');
            }
        },
        getSelectedTable(table) {
            this.selectedTable = table;
            this.getTableData();
        },
        handleDeleteRow(id) {
            console.log('Удаление', id);

        },
        openAddRow() {
            this.showAddRow = true
        },
        handleError(err, defaultMessage) {
            console.error(defaultMessage, err.response?.data || err.message);
            this.error = `${defaultMessage}: ${err.response?.data?.message || err.message}`;
        },
        closeAddRow() {
            this.showAddRow = false;
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