<template>
    <header class="header">
        <div class="header__wrapper">
            <div class="header__selecting">
                <div class="header__title"><span class="header__name">Выбрать таблицу</span></div>
                <div class="header__table">
                    <select class="header__select" v-model="selectedTableChild">
                        <option v-for="(table, index) in tables" :key="index" :value="table" class="header__option">
                            {{ table }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="header__buttons">
                <button class="header__btn header__btn_add-row" @click="$emit('openAddRow')"
                    v-if="role != 'user'">Добавить</button>
                <button class="header__btn header__refresh" @click="$emit('refreshData')">Обновить таблицу</button>
                <button @click="exit" class="header__btn header__signout">Выход</button>
            </div>
        </div>
    </header>
</template>

<script>
export default {
    props: {
        tables: {
            type: Array,
            required: true
        },
        selectedTable: {
            type: String,
            default: ""
        }, role: {
            type: String
        }
    },
    data() {
        return {
            selectedTableChild: ""
        };
    },
    mounted() {
        this.preloadSelectedTable();
    },
    methods: {
        exit() {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            this.$router.push("/");
        },
        preloadSelectedTable() {
            if (this.tables.length > 0) {
                this.selectedTableChild = this.selectedTable || this.tables[0];
                this.$emit("tableSelected", this.selectedTableChild);
            }
        }
    },
    watch: {
        selectedTableChild(newVal) {
            this.$emit("tableSelected", newVal);
        },
        tables: {
            handler(newTables) {
                if (newTables.length > 0 && !this.selectedTableChild) {
                    this.selectedTableChild = this.selectedTable || newTables[0];
                    this.$emit("tableSelected", this.selectedTableChild);
                }
            },
            immediate: true
        }
    }
};
</script>


<style>
.header {
    margin-top: 15px;
}

.header__wrapper {
    background-color: #A7CEA7;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 36px;
    border-radius: 5px;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.3);
}

.header__selecting {
    display: flex;
    gap: 10px;
    align-items: center;
}

.header__title {}

.header__name {
    font-family: 'Open Sans', sans-serif;
    font-weight: bold;
    font-size: 20px;
    color: #fff;
}

.header__select {
    font-family: 'Open Sans', sans-serif;
    font-weight: 200;
    font-size: 20px;
    width: 235px;
    height: 35px;
    background-color: #fff;
}

.header__option {
    font-family: 'Open Sans', sans-serif;
    font-weight: 200;
    font-size: 20px;
}

.header__buttons {
    display: flex;
    align-items: center;
    gap: 15px;
}

.header__btn {
    padding: 0 10px;
    height: 35px;
    background-color: #4DA2E7;
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
    font-size: 16px;
    color: #fff;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.3);
}

.header__signout:hover {
    background-color: #D9262A;
    transition: 0.2s linear;
}

.header__refresh {
    background-color: #4DA2E7;
    color: #fff;
}

.header__refresh:hover,
.header__btn_add-row:hover {
    color: #000;
    background-color: #fff;
    transition: 0.2s linear;
}
</style>