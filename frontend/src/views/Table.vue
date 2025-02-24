<template>
    <Notification v-if="activateNotification" :message="notificationMessage" :type="notificationType"
        :duration="3000" />
    <Preload class="preload" v-if="isLoading && showEmptyMessage" />
    <div class="table" v-else>
        <div class="table__search">
            <input type="text" v-model="searchQuery" placeholder="Введите текст для поиска" class="table__search-input">
            <Filter @filteredLogsUpdated="updateFilteredLogs" :selectedTable="selectedTable" :headers="headers"
                :token="token" :data="data" />
        </div>

        <table class="table__wrapper" v-if="filterData.length > 0 && headers.length > 0">
            <thead class="table__head">
                <tr class="table__row">
                    <th class="table__cell table__cell_header" v-for="(header, index) in headers" :key="index">
                        {{ header }}
                    </th>
                </tr>
            </thead>
            <tbody class="table__body">
                <tr class="table__row" v-for="row in filteredData" :key="row.id">

                    <td class="table__cell" v-for="(cell, key) in row" :key="key">
                        <span v-if="key === 'created_at' || key === 'updated_at'|| key === 'timestamp'" class="table__date">
                            {{ formatDate(cell) }}
                        </span>
                        <span v-else> {{ formatValue(cell) }}</span>
                    </td>
                    <td class="table__wrap-btn">
                        <div class="table__buttons">
                            <button class="table__btn table__btn_change" @click="openEditWindow(row)"
                                v-if="!isRestrictedTable(selectedTable) && role !== 'user'"
                                aria-label="Изменить запись">
                                Изменить
                            </button>
                            <button class="table__btn table__btn_delete" @click="onDeleteRow(row.id)"
                                v-if="!isRestrictedTable(selectedTable, true) && role !== 'user'"
                                aria-label="Удалить запись">
                                Удалить
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>


        <div class="table__wrapper table__wrapper_empty" v-else-if="showEmptyMessage">
            <h1 class="table__explanation">
                Данная таблица <span>{{ selectedTable }}</span> пустая
            </h1>
        </div>

        <div class="table__wrapper table__wrapper_empty" v-else-if="searchNotFound">
            <h1 class="table__explanation">
                По запросу "<span>{{ searchQuery }}</span>" ничего не найдено
            </h1>
        </div>
    </div>
</template>

<script>
import Preload from '@/components/Preload.vue';
import Notification from '@/components/Notification.vue';
import ChangeRow from '@/components/ChangeRow/ChangeRow.vue';
import Filter from '@/components/Filter/Filter.vue';
import api from '@/services/api';
import { ref, nextTick } from "vue";
import dayjs from "dayjs";

export default {
    emits: ["deleteRow", 'openEditWindow', 'closeEditWindow', 'errorMessage'],
    props: {
        data: {
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
        allSystems: {
            type: Array,
            required: true
        },
        role: {
            type: String
        }
    },
    data() {
        return {
            filteredData: this.data,
            editableRow: {},
            searchQuery: '',
            showEmptyMessage: false,
            searchNotFound: false,
            deletingRow: null,
            showEditModal: false,
            newRow: null,
            token: localStorage.getItem('accessToken'),
            userTypeOptions: null,
            oldRow: null,
            activateNotification: false,
            notificationMessage: '',
            notificationType: 'info',
            isLoading: true,
            showEmptyMessage: false,
        }
    },
    computed: {
        filterData() {
            if (!this.searchQuery) {
                this.showEmptyMessage = this.data.length === 0;
                this.searchNotFound = false; // Сбрасываем поиск
                return this.data;
            }

            const lowerQuery = this.searchQuery.toLowerCase();
            const filtered = this.localData.filter(row =>
                Object.values(row).some(value => String(value).toLowerCase().includes(lowerQuery))
            );

            this.showEmptyMessage = false;
            this.searchNotFound = filtered.length === 0;

            return this.filteredData;

        },
    },
    components: {
        Preload, Notification, ChangeRow, Filter
    },
    mounted() {
        this.fetchUserTypeOptions();
    },
    watch: {
        data: {
            handler(newData) {
                this.filteredData = [...newData];
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        formatDate(dateString) {
            if (!dateString) return "-";
            return dayjs(dateString).format("YYYY-MM-DD HH:mm:ss");
        },
        formatValue(value) {
            if (value === null || value === "" || value === undefined) {
                return "None";
            }
            return value;
        },
        isRestrictedTable(table, includeAccessRights = false) {
            const restrictedTables = ['logs', 'open_in_systems', 'users', 'access_rights_attr'];
            if (includeAccessRights) restrictedTables.push('access_rights');
            return restrictedTables.includes(table);
        },
        // Открытие модального окна для измнение строки
        openEditWindow(row) {
            this.editableRow = { ...row };
            this.showEditModal = true;
        },
        // Закрытие модального окна для измнение строки
        closeEditWindow() {
            this.showEditModal = false;
            this.editableRow = {};
        },
        // Отправка обновленной строки
        async sendEdit(row) {
            if (this.selectedTable === 'access_rights') {
                for (const key of Object.keys(row)) {
                    if (key === 'user_type') {
                        try {
                            const response = await api.patch('/access_rights/user_type',
                                {
                                    departmentName: row.department_name,
                                    positionName: row.position_name,
                                    user_type: row.user_type
                                },
                                {
                                    headers: {
                                        Authorization: `Bearer ${this.token}`
                                    },

                                }
                            );
                            if (response.status === 200) {
                                this.notificationMessage = response.data.message;
                                this.notificationType = 'success';
                                this.activateNotification = true;

                                setTimeout(() => {
                                    this.activateNotification = false;
                                }, 3000);
                            }
                        } catch (err) {
                            this.notificationMessage = err.response.data.message;
                            this.notificationType = 'error';
                            this.activateNotification = true;

                            setTimeout(() => {
                                this.activateNotification = false;
                            }, 3000);
                        }
                    }
                    else {
                        this.oldRow = this.data.find(row => row.id === this.editableRow.id);
                        const checkUpdate = (nameTable, editableRow) => {
                            if (!this.oldRow) return null;

                            if (nameTable == 'access_rights') {
                                const result = {
                                    id: this.oldRow.id,
                                    department_id: this.oldRow.department_id,
                                    position_id: this.oldRow.position_id,
                                    openForSystem: [],
                                    closeForSystem: []
                                };
                                let hasChanges = false;
                                for (const key in editableRow) {
                                    if (editableRow.hasOwnProperty(key) && this.oldRow[key] !== editableRow[key]) {
                                        if (this.allSystems.includes(key)) {

                                            if (editableRow[key] === 1) {
                                                result.openForSystem.push(key);
                                            } else if (editableRow[key] === 0) {
                                                result.closeForSystem.push(key);
                                            }
                                        } else {

                                            result[key] = editableRow[key];
                                        }
                                        hasChanges = true;
                                    }
                                }

                                return hasChanges ? result : null;
                            } else {
                                const checkForUpdate = (oldCheckRow, editableRow) =>
                                    JSON.stringify(oldCheckRow) !== JSON.stringify(editableRow) ? editableRow : null;
                                return checkForUpdate(this.oldRow, editableRow);
                            }
                        };
                        const updatedRow = checkUpdate(this.selectedTable, this.editableRow);

                        try {
                            const response = await api.post('/access_rights',
                                {
                                    department_id: formData.department_id,
                                    position_id: formData.position_id,
                                    systems: formData.systems,
                                    user_type: formData.user_type
                                },
                                {
                                    headers: {
                                        Authorization: `Bearer ${this.token}`
                                    }
                                }
                            );
                            if (response.status === 200) {
                                this.notificationMessage = response.data.message;
                                this.notificationType = 'info';
                                this.activateNotification = true;

                                setTimeout(() => {
                                    this.activateNotification = false;
                                }, 3000);
                            }
                            if (response.status === 201) {
                                this.notificationMessage = response.data.message;
                                this.notificationType = 'success';
                                this.activateNotification = true;

                                setTimeout(() => {
                                    this.activateNotification = false;
                                }, 3000);
                            }
                        } catch (err) {
                            this.notificationMessage = err.response.data.message;
                            this.notificationType = 'error';
                            this.activateNotification = true;

                            setTimeout(() => {
                                this.activateNotification = false;
                            }, 3000);
                        }
                    }

                }
            }
        },
        // Функция для получения какого типа должна быть строка user_type в access_right
        async fetchUserTypeOptions() {
            try {
                const response = await api.get('/tables/getUserTypeOptions', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                });
                this.userTypeOptions = response.data.data;
            }
            catch (error) {
                console.error('Ошибка при загрузке userTypeOptions:', error);
            }
        },
        onDeleteRow(rowId) {
            this.$emit("deleteRow", rowId);
        },
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        updateFilteredLogs(filteredLogs) {
            console.log("📌 Обновленные данные в таблице:", filteredLogs);
            this.filteredData = filteredLogs;
        }
    },

}
</script>

<style>
.table {
    padding: 15px 0px;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.table>.table__search {
    display: flex;
    align-items: center;
    justify-content: left;
    gap: 15px;
}

.table__search-input {
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    width: 40%;
    font-family: 'Open Sans', sans-serif;
    font-weight: 200;
    font-size: 16px;
    padding: 15px 15px;
    background-color: #FCFBFC;
    border: 1px solid #ccc;
    border-radius: 11px;
}

.table__wrapper {
    width: 100%;
    border-collapse: collapse;
    background: #FFFFFF;
    border-radius: 8px;
    overflow: hidden;
}

.table__head {
    background-color: #0099CC;
    color: white;
    font-weight: bold;
    text-align: left;
}

.table__cell_actions {
    width: 500px;
    padding: 0 10px;
    text-align: center;
}

.table__cell {
    word-wrap: break-word;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 120px;
    color: #002B5B;
    padding: 8px 5px;
    text-align: center;
    background-color: #fff;
    border: 1px solid #ddd;
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    font-weight: 400;
    box-shadow: none;
}


.table__cell_header {
    font-weight: 700;
    background-color: #f5f5f5;
    border-bottom: 2px solid #ccc;
}

.table__title {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #002B5B;
}

.table__cell_header {
    font-weight: 700;
}

.table__wrap-btn {
    display: flex;
    max-width: 200px;
    justify-content: center;
    align-items: center;
}

.table__buttons {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.table__btn {
    display: block;
    margin: 10px 0;
    width: 120px;
    height: 35px;
    background-color: #fff;
    border: 1px solid #ccc;
    padding: 5px;
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: #002B5B;
    cursor: pointer;
}

.table__btn:hover {
    border: 1px solid #fff;
    background-color: #FFA500;
    transition: 0.3s;
    color: #fff;

}

.table__btn_delete:hover {
    border: 1px solid #fff;
    background-color: #CC3333;
    transition: 0.1s linear;
    color: #fff;
}

.table__wrapper_empty {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    height: 500px;
}

.table__explanation {
    font-family: 'Open Sans', sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: #002B5B;
}

.table__explanation>span {
    font-family: 'Open Sans', sans-serif;
    font-size: 32px;
    font-weight: 700;
    font-style: italic;
    color: #002B5B;
}
</style>