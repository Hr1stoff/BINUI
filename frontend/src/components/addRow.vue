<template>
    <div class="add-row">
        <div class="add-row__wrapper">
            <div class="add-row__header">
                <div class="add-row__title">
                    <span class="add-row__name">Добавление новых данных в: </span>
                    <select class="add-row__select" v-model="selected" @change="onTableSelect">
                        <option v-for="(table, index) in localTables" :key="index" :value="table"
                            class="add-row__option">
                            {{ table }}
                        </option>
                    </select>
                </div>
            </div>
            <form class="add-row__form">
                <div v-for="(item, index) in localTypeColumns" :key="index" class="add-row__field">

                    <label class="add-row__attr-title" :for="`${item.Field}`">{{ item.Field }}</label>

                    <div v-if="item.Field === 'department_id'">
                        <select v-if="item.Field === 'department_id'" v-model="formValues[item.Field]"
                            class="add-row__input">
                            <option v-for="(name, id) in departamentName" :key="id" :value="id">
                                {{ name.name }}
                            </option>
                        </select>
                    </div>

                    <div v-if="item.Field === 'position_id'">
                        <select v-model="formValues[item.Field]" class="add-row__input">
                            <option v-for="(name, id) in positionName" :key="id" :value="id">
                                {{ name.name }}
                            </option>
                        </select>
                    </div>
                    <div v-if="item.Field === 'system_id'">
                        <select v-model="formValues[item.Field]" class="add-row__input">
                            <option v-for="(name, id) in systemName" :key="id" :value="id">
                                {{ name.name }}
                            </option>
                        </select>
                    </div>

                    <div v-if="item.enumValues">
                        <select v-if="item.enumValues" class="add-row__input">
                            <option v-for="item in item.enumValues" :key="item">{{ item }}</option>
                        </select>
                    </div>
                    
                    <div v-else>
                        <input class="add-row__input" v-model="formValues[item.Field]" :id="`${item.Field}`" type="text"
                            v-if="!item.enumValues" />
                    </div>


                </div>
                <div class="add-row__buttons">
                    <button class="add-row__btn" @click="$emit('closeAddRowLocal')">Отмена</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import api from '@/services/api';
export default {
    props: {
        localTables: {
            type: Array,
            required: true,
        },
        selectedTable: {
            type: String,
        },
        localTypeColumns: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            token: localStorage.getItem('accessToken'),
            selected: this.selectedTable || '',
            typeColumns: [],
            formValues: {},
            departamentName: {},
            positionName: {},
            systemName: {}
        };
    },
    mounted() {
        this.getColumns();
        this.loadReferenceData();
    },
    watch: {
        selected(newValue) {
            this.$emit('sendSelectedTable', newValue);
        },
        getTipData() {
            for (let index = 0; index < this.localTypeColumns.length; index++) {
                console.log(this.localTypeColumns[index].Field);
            }
        }
    },
    methods: {
        getColumns() {
            if (this.selectedTable) {
                this.selected = this.selectedTable;
                this.$emit('getColumnsParent', this.selected);
            }
        },
        initializeFormValues() {
            this.formValues = this.typeColumns.reduce((acc, item) => {
                acc[item.Field] = '';
                return acc;
            }, {});
        },
        onTableSelect() {
            this.$emit('getColumnsParent', this.selected);
        },
        async getData(tableName) {
            try {
                const response = await api.get('/tables/getTable', {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                    params: { table: tableName },
                });
                const data = response.data.table;

                return data;
            } catch (err) {
                this.handleError(err, 'Ошибка при получении данных таблицы');
                return null
            }
        },
        async loadReferenceData() {
            if (this.selected == 'access_rights') {
                this.departamentName = await this.getData('departments');
                this.positionName = await this.getData('position');
                this.systemName = await this.getData('systems')
            }
        }

    },
};
</script>

<style>
.add-row {
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

.add-row__wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 1500px;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background-color: #fff;
}

.add-row__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.add-row__title {}

.add-row__name {
    font-family: 'Open Sans', sans-serif;
    font-size: 32px;
    font-weight: 700;
}

.add-row__select {
    font-family: 'Open Sans', sans-serif;
    font-weight: 200;
    font-size: 24px;
    width: 235px;
    background-color: #fff;
    border: 1px solid #ccc;
}

.add-row__option {}


.add-row__form {
    display: flex;
    gap: 10px;

}

.add-row__field {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.add-row__attr-title {
    border: 1px solid #000;
    padding: 5px 10px;
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    font-weight: 800;
    cursor: none;
}

.add-row__input {
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

.add-row__buttons {
    display: flex;
    align-items: center;
}

.add-row__btn {
    width: 150px;
    height: 40px;
    border: 1px solid #000;
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    font-weight: 400;
}

.add-row__btn:hover {
    background-color: #D9262A;
    transition: 0.1s linear;
    border: 1px solid #ccc;
    color: #fff;
}
</style>