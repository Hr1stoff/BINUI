<template>
    <header class="header">
        <div class="header__wrapper">
            <div class="header__selecting">
                <div class="header__title"><span class="header__name">Выбрать таблицу</span></div>
                <div class="header__table"><select class="header__select" v-model="selectedTable">
                        <option v-for="(table, index) in tables" :key="index" :value="table" class="header__option">
                            {{ table }}
                        </option>
                    </select></div>
            </div>
            <div class="header__signout"><button @click="exit" class="header__btn">Выход</button></div>
        </div>
    </header>
</template>

<script>
export default {
    props: {
        tables: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            selectedTable: ""
        }
    },
    methods: {
        exit() {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            this.$router.push("/");
        }
    },
    watch: {
        selectedTable(table) {
            this.$emit('tableSelected', table);
        }
    },
    mounted() {
        if (this.tables.length > 0) {
            this.selectedTable = this.tables[0];

        }
    }
}
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
}

.header__title {}

.header__name {
    font-family: 'Open Sans', sans-serif;
    font-weight: bold;
    font-size: 16px;
    color: #fff;
}

.header__select {
    font-family: 'Open Sans', sans-serif;
    font-weight: 200;
    font-size: 16px;
    width: 235px;
    background-color: #fff;
}

.header__option {
    font-family: 'Open Sans', sans-serif;
    font-weight: 200;
    font-size: 16px;
}

.header__signout {}

.header__btn {
    width: 100px;
    height: 32px;
    background-color: #4DA2E7;
    font-family: 'Open Sans', sans-serif;
    font-weight: bold;
    font-size: 16px;
    color: #fff;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.3);
}
</style>