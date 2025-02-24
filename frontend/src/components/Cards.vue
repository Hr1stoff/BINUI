<template>
    <Notification v-if="activateNotification" :message="notificationMessage" :type="notificationType"
        :duration="3000" />

    <section class="cards">
        <div class="cards__search">
            <input type="text" v-model="searchQuery" placeholder="Поиск..." class="cards__search-input">
            <Filter :selectedTable="selectedTable" :headers="headers" :token="token" :data="data" />

        </div>
        <div class="cards__wrapper"
            v-if="filterData.length > 0 && ['access_rights', 'departments', 'position', 'systems'].includes(selectedTable)">
            <div class="cards__item" v-for="(item, index) in filterData" :key="index">
                <div class="cards__header">
                    <div class="cards__title">
                        <span class="cards__name">{{ item.position_name || item.name }}</span>
                        <span class="cards__name cards__name_bold">{{ item.department_name }}</span>
                    </div>
                    <div class="cards__modal">
                        <button class="cards__btn-modal" @click="toggleCardBtns(index)">&#8226; &#8226;
                            &#8226;</button>
                        <div class="cards__modal-wrap" v-if="showCardBtns[index]">
                            <button class="cards__btn cards__btn_change" @click="openEditWindow(row)"
                                v-if="!isRestrictedTable(selectedTable) && role !== 'user'"
                                aria-label="Изменить запись">
                                Изменить
                            </button>
                            <button class="cards__btn cards__btn_delete" @click="onDeleteRow(item.id)"
                                v-if="!isRestrictedTable(selectedTable, true) && role !== 'user'"
                                aria-label="Удалить запись">
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
                <div class="cards__user-type" v-if="selectedTable == 'access_rights'">
                    <img class="cards__icon" :src="(item.user_type || '') === 'ФИО' ? iconArr.user : iconArr.shop">
                    <span class="cards__user-type-title">{{ item.user_type }}</span>
                </div>
                <div class="cards__systems">
                    <div class="cards__system" v-for="(system, sysIndex) in item.systems" :key="sysIndex"
                        :class="{ 'cards__system_access': system && Object.values(system)[0] === 1 }">
                        <span class="cards__system-name">{{ system ? Object.keys(system)[0] : '' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="cards__wrapper" v-if="filterData.length > 0 && ['system_attributes'].includes(selectedTable)">
            <div class="cards__item" v-for="(item, index) in filterData" :key="index">
                <div class="cards__header">
                    <div class="cards__title">
                        <span class="cards__name cards__name_system">{{ item.system_name }}</span>
                    </div>
                    <div class="cards__modal">
                        <button class="cards__btn-modal" @click="toggleCardBtns(index)">&#8226; &#8226;
                            &#8226;</button>
                        <div class="cards__modal-wrap" v-if="showCardBtns[index]">
                            <button class="cards__btn cards__btn_change" @click="openEditWindow(item)"
                                v-if="!isRestrictedTable(selectedTable) && role !== 'user'"
                                aria-label="Изменить запись">
                                Изменить
                            </button>
                            <button class="cards__btn cards__btn_delete" @click="onDeleteRow(item.id)"
                                v-if="!isRestrictedTable(selectedTable, true) && role !== 'user'"
                                aria-label="Удалить запись">
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
                <div class="cards__attribute">
                    <div class="cards__attribute-row">
                        <p class="cards__name cards__value">{{ item.name }}</p>
                    </div>
                    <div class="cards__attribute-row">
                        <p class="cards__name cards__name">{{ item.value }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="cards__wrapper" v-if="filterData.length > 0 && ['access_rights_attr'].includes(selectedTable)">
            <div class="cards__item" v-for="(item, index) in filterData" :key="index">
                <div class="cards__header">
                    <div class="cards__title">
                        <span class="cards__name">{{ item.position }}</span>
                        <span class="cards__name cards__name_bold">{{ item.department }}</span>
                        <span class="cards__name cards__name_system">{{ item.system_name }}</span>
                    </div>
                    <div class="cards__modal">
                        <button class="cards__btn-modal" @click="toggleCardBtns(index)">&#8226; &#8226;
                            &#8226;</button>
                        <div class="cards__modal-wrap" v-if="showCardBtns[index]">
                            <button class="cards__btn cards__btn_change" @click="openEditWindow(row)"
                                v-if="!isRestrictedTable(selectedTable) && role !== 'user'"
                                aria-label="Изменить запись">
                                Изменить
                            </button>
                            <button class="cards__btn cards__btn_delete" @click="onDeleteRow(item.id)"
                                v-if="!isRestrictedTable(selectedTable, true) && role !== 'user'"
                                aria-label="Удалить запись">
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>

                <div class="cards__attribute">
                    <div class="cards__attribute-row">
                        <p class="cards__name cards__value">{{ item.attribute }}</p>
                    </div>
                    <div class="cards__attribute-row">
                        <p class="cards__name cards__name">{{ item.value }}</p>
                    </div>
                </div>
            </div>
        </div>

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
    </section>

    <ChangeRow :selectedTable="selectedTable" v-if="showEditModal" :editableRow="editableRow"
        :userTypeOptions="userTypeOptions" :allSystems="allSystems" @close="closeEditWindow" @save="sendEdit" />

    <ConfirmationDialog v-if="showConfirmWindow" title="Подтверждение удаления"
        message="Вы уверены, что хотите удалить эту запись?" @confirmAction="confirmDelete"
        @closeConfirmWindow="showConfirmWindow = false" />


</template>

<script>
import userIcon from '@/assets/img/user.png';
import shopIcon from '@/assets/img/shop.png';
import Filter from '@/components/Filter/Filter.vue';
import ChangeRow from '@/components/ChangeRow/ChangeRow.vue';
import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
import Notification from '@/components/Notification.vue';

import api from '@/services/api';
import { ref, nextTick } from "vue";

export default {
    inject: ['getTableData'],
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
    components: {
        Filter, ChangeRow, ConfirmationDialog, Notification
    },
    data() {
        return {
            token: localStorage.getItem('accessToken'),
            searchQuery: '',
            editableRow: {},
            userTypeOptions: null,
            showEmptyMessage: false,
            searchNotFound: false,
            deletingRow: null,
            showEditModal: false,
            isLoading: true,
            showEmptyMessage: false,
            iconArr: {
                user: userIcon,
                shop: shopIcon
            },
            showCardBtns: {},
            showConfirmWindow: false,
            activateNotification: false,
            notificationMessage: '',
            notificationType: 'info',
        }
    },
    computed: {
        filterData() {
            if (!this.searchQuery) {
                this.showEmptyMessage = this.data.length === 0;
                this.searchNotFound = false;
                return this.data;
            }

            const lowerQuery = this.searchQuery.toLowerCase();
            const filtered = this.data.filter(row =>
                Object.values(row).some(value => String(value).toLowerCase().includes(lowerQuery))
            );

            this.showEmptyMessage = false;
            this.searchNotFound = filtered.length === 0;

            return filtered;
        },
    },
    watch: {
        selectedTable() {
            this.showCardBtns = {};
        }
    },
    methods: {
        isRestrictedTable(table, includeAccessRights = false) {
            const restrictedTables = ['logs', 'open_in_systems', 'users', 'access_rights_attr'];
            if (includeAccessRights) restrictedTables.push('access_rights');
            return restrictedTables.includes(table);
        },
        toggleCardBtns(index) {
            if (this.showCardBtns[index]) {
                this.showCardBtns = {};
                document.removeEventListener("click", this.handleClickOutside);
            } else {
                this.showCardBtns = { [index]: true };
                this.$nextTick(() => {
                    document.addEventListener("click", this.handleClickOutside);
                });
            }
        },
        handleClickOutside(event) {
            if (!event.target.closest(".cards__modal")) {
                this.showCardBtns = {};
                document.removeEventListener("click", this.handleClickOutside);
            }
        },
        openEditWindow(row) {
            this.editableRow = { ...row };
            this.showEditModal = true;
        },
        closeEditWindow() {
            this.showEditModal = false;
            this.editableRow = {};
        },
        onDeleteRow(id) {
            this.showConfirmWindow = true;
            this.deletingRow = id;
        },
        // удаление строки
        async confirmDelete() {
            if (!this.deletingRow) return;

            try {
                const response = await api.delete(`/${this.selectedTable}/${this.deletingRow}`, {
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
                this.deletingRow = null;
            }
        }
    }

}
</script>

<style>
.cards {
    padding: 15px 0px;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.cards__search {
    display: flex;
    align-items: center;
    justify-content: left;
    gap: 15px;
}

.cards__search-input {
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

.cards__wrapper {
    padding-bottom: 20px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
}

.cards__item {
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 11px;
    width: 100%;
    max-height: 300px;
    padding: 25px 25px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
    background-color: #FCFBFC;
}

.cards__header {
    display: flex;
    justify-content: space-between;
}

.cards__title {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 250px;
}

.cards__name {
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
    font-size: 16px;
}

.cards__name_bold {
    font-family: 'Open Sans', sans-serif;
    font-weight: 600;
    font-size: 16px;
}

.cards__btn {
    color: #999B9D;
}

.cards__user-type {
    display: flex;
    align-items: center;
    gap: 5px;
}

.cards__user-type-title {
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
    font-size: 16px;
}

.cards__icon {
    width: 31px;
    height: 31px;
}

.cards__modal {
    position: relative;
}

.cards__btn-modal {
    color: #ccc;
}

.cards__modal-wrap {
    width: 120px;
    position: absolute;
    top: 15px;
    right: -25px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    z-index: 10;
}

.cards__btn {
    width: 100%;
    padding: 10px 9px;
    display: block;
    color: #fff;
    background-color: #6506EF;
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
    font-size: 14px;
    transition: 0.2s linear;
    cursor: pointer;
    border-radius: 11px;
}

.cards__btn_change {
    border: 1px solid #ccc;
}

.cards__btn_change:hover {
    color: #0A04A9;
    background-color: #fff;
    transition: 0.3s;
}

.cards__btn_delete:hover {
    background-color: #CC3333;
    transition: 0.3s;
}

.cards__systems {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.cards__system {
    max-width: 120px;
    background-color: #E9ECF4;
    padding: 5px 8px;
    border-radius: 11px;
}

.cards__system-name {
    font-family: 'Open Sans', sans-serif;
    font-weight: 600;
    font-size: 12px;
    color: #000;
}

.cards__system_access {
    background-color: #A7CEA7;
}

.cards__name_system {
    color: #99A0AE;
}

.cards__attribute {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
}

.cards__name_attribute {
    font-weight: 600;
    font-size: 14px;
}

.cards__value {
    color: #333;
    text-transform: uppercase;
}
</style>