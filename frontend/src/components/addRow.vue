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
                <form class="add-row__form">
                    <div v-for="(item, index) in localTypeColumns" :key="index" class="add-row__field">
                        <label :for="`field-${index}`">{{ item.Field }}</label>
                        <input v-model="formValues[item.Field]" :id="`field-${index}`" type="text" />
                        <select name="" id="" v-if="item.enumValues">
                            <option v-for="item in item.enumValues" :key="item">{{ item }}</option>
                        </select>
                    </div>
                </form>
                <div class="add-row__buttons">
                    <button class="add-row__btn" @click="$emit('closeAddRowLocal')">Отмена</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
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
            selected: this.selectedTable || '',
            typeColumns: [],
            formValues: {},
        };
    },
    mounted() {
        this.getColumns();
    },
    watch: {
        selected(newValue) {
            this.$emit('sendSelectedTable', newValue);
        },
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
    width: 100%;
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
    padding: 15px 0px;
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

.add-row__buttons {}

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