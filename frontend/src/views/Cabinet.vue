<template>
    <!-- Уведомления -->
    <Notification v-if="activateNotification" :message="notificationMessage" :type="notificationType"
        :duration="3000" />
    <!-- Окно подтверждения удаления -->
    <ConfirmationDialog v-if="showConfirmWindow" title="Подтверждение удаления"
        message="Вы уверены, что хотите удалить эту запись?" @confirmAction="confirmDelete"
        @closeConfirmWindow="showConfirmWindow = false" />

    <div class="preloader" v-if="isLoading">
        <Preload />
    </div>
    <div v-else>
        <Header :selectedTable="selectedTable" :tables="tables" @tableSelected="getSelectedTable"
            @refreshData="fetchData" @openAddRow="openAddRow" :role="role" />

        <Table :data="dataTable" :headers="headers" :selectedTable="selectedTable" @deleteRow="openConfirmWindow"
            :allSystems="allSystems" :role="role" />

        <!-- Компонент для создания новых строк -->
        <CreateRow v-if="showAddRow" :selectedTable="selectedTable" :localTables="tables"
            @closeCreateWindow="onCloseCreateWindow" />

        <!-- Кнопка для прокрутки -->
        <button v-if="showScrollButton && !showAddRow" class="scroll-button" @click="scrollToBottom">
            {{ isAtBottom ? "↑" : "↓" }}
        </button>
    </div>

</template>

<script>
//Компоненты 
import Preload from '@/components/Preload.vue';
import Header from '@/components/Header.vue';
import Table from '@/views/Table.vue';
import CreateRow from '@/components/CreateRow/CreateRow.vue';
import Notification from '@/components/Notification.vue';
import ConfirmationDialog from '@/components/ConfirmationDialog.vue';

import api from '@/services/api';

export default {
    data() {
        return {
            token: localStorage.getItem('accessToken'),
            role: localStorage.getItem('role'),
            isLoading: true,
            headers: [],
            tables: [],
            dataTable: [],
            selectedTable: '',
            allSystems: [],
            typeColumns: [],
            showAddRow: false,
            activateNotification: false,
            notificationMessage: '',
            notificationType: 'info',
            showConfirmWindow: false,
            rowToDelete: null,
            isAtBottom: false, // Переменная для проверки, находится ли пользователь внизу
            showScrollButton: false // Отображение кнопки скролла
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
        };
        this.getTableData();
        window.addEventListener('scroll', this.handleScroll);
    },
    components: {
        Header,
        Table,
        Preload,
        CreateRow,
        Notification,
        ConfirmationDialog
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        // Метод для обработки скролла и определения положения страницы
        handleScroll() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const clientHeight = document.documentElement.clientHeight;
            const scrollHeight = document.documentElement.scrollHeight;

            this.isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
            this.showScrollButton = scrollHeight > clientHeight + 100;
        },
        // Метод для скролла вниз/вверх
        scrollToBottom() {
            if (this.isAtBottom) {
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
            }
        },
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        // обновленние данных 
        async fetchData() {
            try {
                this.isLoading = true;
                this.showEmptyMessage = false;

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
        // получение имен Таблиц
        async getTables() {
            try {
                const response = await api.get('/tables/tablesName', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                });
                this.tables = response.data.tables;

                if (this.tables.length > 0) {
                    this.selectedTable = this.tables[0];
                }
            } catch (err) {
                this.handleError(err, 'Ошибка при получении списка таблиц');
            }
        },
        // получение данных из таблиц
        async getTableData() {
            try {
                this.dataTable = [];
                await this.delay(1500);

                const response = await api.get(`/${this.selectedTable}`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });
                if (!response.data || !Array.isArray(response.data.data)) {
                    throw new Error(`Неверный формат данных: ${JSON.stringify(response.data)}`);
                }

                this.dataTable = response.data.data.sort((a, b) => a.id - b.id);

                if (this.dataTable.length > 0) {
                    this.headers = Object.keys(this.dataTable[0]);
                }

            } catch (err) {
                this.notificationMessage = err instanceof Error ? err.message : String(err);
                this.notificationType = 'error';
                this.activateNotification = true;

                setTimeout(() => {
                    this.activateNotification = false;
                }, 3000);
            }

        },
        //обновленние данных
        async loadData() {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (error) {
                this.notificationMessage = typeof err.response?.data?.message === 'string'
                    ? err.response.data.message
                    : `Ошибка: ${JSON.stringify(err.response?.data || err.message || err)}`;

                this.notificationType = 'error';
                this.activateNotification = true;

                setTimeout(() => {
                    this.activateNotification = false;
                }, 3000);
            } finally {
                this.isLoading = false;
            }
        },
        // получение данных из таблице Systems
        async getSystems() {
            try {
                const response = await api.get('/systems', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }

                });
                const result = response.data.data
                this.allSystems = result.map(system => system.name);
            }
            catch (err) {
                this.handleError(err, 'Ошибка при получении списка таблиц');
            }
        },
        // получение информации о полях в таблице
        async getColumns(nameTable) {
            try {
                const response = await api.get('/tables/typeTable', {
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
        // получение выбранной таблицы
        getSelectedTable(table) {
            this.selectedTable = table;
            this.getTableData();
        },
        openConfirmWindow(id) {
            this.rowToDelete = id;
            this.showConfirmWindow = true;
        },
        // удаление строки по id в выбранной таблице
        async confirmDelete() {
            if (!this.rowToDelete) return;

            try {
                const response = await api.delete(`/${this.selectedTable}/${this.rowToDelete}`, {
                    headers: { Authorization: `Bearer ${this.token}` }
                });

                if (response.status === 200) {
                    this.notificationMessage = response.data.message;
                    this.notificationType = 'success';
                    this.activateNotification = true;

                    setTimeout(() => {
                        this.activateNotification = false;
                    }, 3000);

                    this.showConfirmWindow = false;
                    await this.getTableData();
                }
            } catch (err) {
                if (err.response) {
                    const { status, data } = err.response;

                    if (status === 404) {
                        this.notificationMessage = `Ошибка: Запись ${this.rowToDelete} не найдена.`;
                    } else if (status === 400) {
                        this.notificationMessage = data.message || 'Ошибка: Удаление невозможно из-за зависимостей.';
                    } else if (status === 500) {
                        this.notificationMessage = 'Серверная ошибка при удалении. Попробуйте позже.';
                    } else {
                        this.notificationMessage = `Ошибка: ${data.message || 'Неизвестная ошибка'}`;
                    }
                } else {
                    this.notificationMessage = 'Ошибка соединения с сервером.';
                }

                this.notificationType = 'error';
                this.activateNotification = true;

                setTimeout(() => {
                    this.activateNotification = false;
                }, 5000);
                setTimeout(() => {
                    this.showConfirmWindow = false;
                    this.getTableData();
                }, 2000);
            } finally {
                this.rowToDelete = null;
            }
        }
        ,
        // открытие модульного окна для создания новых данных
        openAddRow() {
            this.showAddRow = true
        },
        //закрытие модульного окна для создания новых данных
        onCloseCreateWindow() {
            this.showAddRow = false;
        },
        // Обработка ошибок
        handleError(err, message) {
            console.error(message, err);
            this.notificationMessage = message;
            this.notificationType = 'error';
            this.activateNotification = true;

            setTimeout(() => { this.activateNotification = false; }, 3000);
        },

    },
    provide() {
        return {
            getTableData: this.getTableData,
        }
    }
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

.scroll-button {
    position: fixed;
    bottom: 30px;
    background-color: #0077AA;
    right: 35px;
    color: white;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    font-size: 20px;
    transition: 0.3s;
    z-index: 1000;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.3);
}

.scroll-button:hover {
    background-color: #0056b3;
}
</style>