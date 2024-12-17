<template>
    <div class="table">
        <div class="table__search">
            <input type="text" v-model="searchQuery" placeholder="Введите текст для поиска" class="table__search-input">
        </div>
        <Preload v-if="isLoading" />


        <div class="table__wrapper table__wrapper_empty" v-else-if="!isLoading && data.length === 0">
            <h1 class="table__explanation">
                Данная таблица <span>
                    {{ selectedTable }}
                </span> пустая
            </h1>
        </div>
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
        <div class="table__modal" v-if="modalShow">
            <div class="table__modal-content">
                <h3 class="table__modal-title">
                    Редактирование строки
                </h3>
                <form class="table__modal-form">
                    <div class="table__modal-field" v-for="(value, key) in editableRow" :key="key">
                        <label class="table__modal-label">{{ key }}:</label>
                        <textarea v-model="editableRow[key]" class="table__modal-input" rows="1"
                            :readonly="key === 'id'"></textarea>
                    </div>
                    <div class="table__modal-buttons">
                        <button class="table__modal-btn table__modal-btn_safe">Сохранить</button>
                        <button type="button" class="table__modal-btn table__modal-btn_cancel"
                            @click="closeEditWindow">Отменить</button>
                    </div>
                </form>

            </div>
        </div>
    </div>
</template>

<script>
import Preload from '@/components/Preload.vue';
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
        }
    },
    data() {
        return {
            searchQuery: '',
            isLoading: true,
            deletingRow: null,
            modalShow: false,
            editableRow: {},
            token: localStorage.getItem('accessToken')
        }
    },
    computed: {
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
        openEditWindow(row) {
            this.editableRow = { ...row };

            this.modalShow = true;
        },
        closeEditWindow() {
            this.modalShow = false;
            this.editableRow = {};
        },
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

.table__explanation{
    font-family: 'Open Sans', sans-serif;
    font-size: 32px;
    font-weight: 700;
}
.table__explanation > span{
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