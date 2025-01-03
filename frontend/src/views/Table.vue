<template>
    <div class="table">
        <!-- После поиска  -->
        <div class="table__search">
            <input type="text" v-model="searchQuery" placeholder="Введите текст для поиска" class="table__search-input">
        </div>

        <!-- Отображение таблицы -->
        <table class="table__wrapper" v-if="filterData.length > 0 && headers.length > 0">
            <thead class="table__head">
                <tr class="table__row">
                    <th class="table__cell table__cell_header" v-for="(header, index) in headers" :key="index">{{
                        header }}</th>
                </tr>
            </thead>
            <tbody class="table__body">
                <tr class="table__row" v-for="row in filterData" :key="row.id">
                    <td class="table__cell" v-for="(cell, key) in row" :key="key"><span class="table__title">{{
                        cell }}</span>
                    </td>
                    <td class="table__wrap-btn">
                        <div class="table__buttons">
                            <button class="table__btn table__btn_change" @click="openEditWindow(row)">
                                Изменить</button>
                            <button class="table__btn table__btn_delete"
                                @click="$emit('deleteRow', row.id)">Удалить</button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Модально окно по измнению строки -->
        <div class="table__modal" v-if="modalShow">
            <div class="table__modal-content">
                <h3 class="table__modal-title">
                    Редактирование строки
                </h3>
                <form class="table__modal-form" @submit.prevent="sendEdit">
                    <div class="table__modal-field" v-for="(value, key) in editableRow" :key="key">
                        <label class="table__modal-label">{{ key }}:</label>

                        <select v-if="key === 'user_type'" v-model="editableRow[key]" class="table__modal-input">
                            <option v-for="option in userTypeOptions" :key="option" :value="option">{{ option }}
                            </option>
                        </select>
                        <select v-else-if="allSystems.includes(key)" v-model="editableRow[key]"
                            class="table__modal-input">
                            <option :value="0">0</option>
                            <option :value="1">1</option>
                        </select>

                        <textarea v-else v-model="editableRow[key]" class="table__modal-input" rows="1"
                            :readonly="key === 'id'">
                        </textarea>
                    </div>
                    <div class="table__modal-buttons">
                        <button class="table__modal-btn table__modal-btn_safe">Сохранить</button>
                        <button type="button" class="table__modal-btn table__modal-btn_cancel"
                            @click="closeEditWindow">Отменить</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Preload для ожидания ответа из бд -->
        <Preload v-if="isLoading" />
        <!-- Если таблица пустая  -->
        <div class="table__wrapper table__wrapper_empty" v-else-if="!isLoading && data.length === 0">
            <h1 class="table__explanation">
                Данная таблица <span>
                    {{ selectedTable }}
                </span> пустая
            </h1>
        </div>
    </div>
</template>

<script>
import Preload from '@/components/Preload.vue';
import api from '@/services/api';
export default {
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
        }
    },
    data() {
        return {
            searchQuery: '',
            isLoading: true,
            deletingRow: null,
            modalShow: false,
            editableRow: null,
            newRow: null,
            token: localStorage.getItem('accessToken'),
            userTypeOptions: null,
            oldRow: null,

        }
    },
    computed: {
        // Поиск в таблице
        filterData() {
            if (!this.searchQuery) {
                return this.data;
            }
            const lowerQuery = this.searchQuery.toLowerCase();
            return this.data.filter(row => Object.values(row).some(value => String(value).toLowerCase().includes(lowerQuery)))
        },
    }, components: {
        Preload
    },
    mounted() {
        this.fetchUserTypeOptions();
    },
    watch: {
        data: {
            handler(newData) {
                if (newData.length > 0) {
                    this.isLoading = false;
                } else if (!this.isLoading) {
                    this.isLoading = false;
                }
            },
            immediate: true
        }
    },
    methods: {
        // Открытие модального окна для измнение строки
        openEditWindow(row) {
            this.editableRow = { ...row };
            this.modalShow = true;
        },
        // Закрытие модального окна для измнение строки
        closeEditWindow() {
            this.modalShow = false;
            this.editableRow = {};
        },
        // Отправка обновленной строки
        sendEdit() {
            // Получение старых данных строки
            this.oldRow = this.data.find(row => row.id === this.editableRow.id);
            // Функция определения в какой таблице поменялась строка
            // Также обновлись ли данные или нет 
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

            // ПОМЕНЯТЬ НА ОТДЕЛЬНОЕ ОКНО УВЕДОМЛЕНИЯ
            if (!updatedRow) {
                alert('Вы ничего не поменяли!');
                return;
            }

            this.newRow = updatedRow;
            // отправка данных
            if (this.newRow) {
                try {
                    const response = api.patch('/update/changeRow',
                        {
                            nameTable: this.selectedTable,
                            oldRow: this.oldRow,
                            editRow: this.newRow
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${this.token}`
                            }
                        });
                    console.log('Ответ от сервера:', response.data);
                } catch (err) {
                    alert(err, 'Ошибка при сохранении изменений.');
                }
            }
        },
        // Функция для получения какого типа должна быть строка user_type в access_right
        async fetchUserTypeOptions() {
            try {
                const response = await api.get('/userType/getUserTypeOptions', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                });
                this.userTypeOptions = response.data.userTypeOptions;
            }
            catch (error) {
                console.error('Ошибка при загрузке userTypeOptions:', error);
            }
        }
    }

}
</script>

<style>
.table {
    margin: 15px 0;
    background-color: #A7CEA7;
    padding: 15px 30px;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.3);
    border-radius: 5px;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.table__search {
    width: 500px;
}

.table__search-input {
    width: 100%;
    font-family: 'Open Sans', sans-serif;
    font-weight: 200;
    font-size: 16px;

    padding: 8px;
    background-color: #fff;
}

.table__wrapper {
    width: 100%;
}

.table__cell {
    word-wrap: break-word;

    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 120px;

    color: #000;
    padding: 8px 5px;


    text-align: center;
    background-color: #fff;
    border: 1px solid #ccc;
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
}

.table__title {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #000;
}

.table__cell_header {
    font-weight: 700;
}

.table__wrap-btn {
    display: flex;
    max-width: 200px;
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
    color: #000;
    cursor: pointer;
}

.table__btn:hover {
    border: 1px solid #fff;
    background-color: #A7CEA7;
    transition: 0.1s linear;
    color: #fff;

}

.table__btn_delete:hover {
    border: 1px solid #fff;
    background-color: #D9262A;
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
}

.table__explanation>span {
    font-family: 'Open Sans', sans-serif;
    font-size: 32px;
    font-weight: 700;
    font-style: italic;
}

.table__modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.table__modal-content {
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background-color: #fff;
}

.table__modal-form {
    display: flex;
    gap: 10px;
}

.table__modal-title {
    font-family: 'Open Sans', sans-serif;
    font-size: 32px;
    font-weight: 700;
    padding: 15px 0px;
}

.table__modal-field {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.table__modal-label {
    border: 1px solid #000;
    padding: 5px 10px;
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    font-weight: 800;
    cursor: none;
}

.table__modal-input {
    width: 100%;
    box-sizing: border-box;
    resize: none;
    overflow: hidden;
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    font-weight: 400;
    padding: 10px;
    line-height: 1.5;
    min-height: 100px;
    border: none;
    outline: none;
    cursor: pointer;
    border: 1px solid #000;
}

.table__modal-buttons {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15px;
}

.table__modal-btn {
    width: 150px;
    height: 40px;
    border: 1px solid #000;

    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    font-weight: 400;
}

.table__modal-btn_safe:hover {
    background-color: #A7CEA7;
    transition: 0.1s linear;
    border: 1px solid #ccc;
    color: #fff;
}

.table__modal-btn_cancel:hover {
    background-color: #D9262A;
    transition: 0.1s linear;
    border: 1px solid #ccc;
    color: #fff;
}
</style>