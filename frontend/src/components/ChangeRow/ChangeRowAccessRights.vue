<template>
    <form class="table__modal-form" @submit.prevent="sendEdit">
        <div class="table__modal-field" v-for="(value, key) in editableRow" :key="key">
            <label class="table__modal-label">{{ key }}:</label>

            <select v-if="key === 'user_type'" v-model="editableRow[key]" class="table__modal-input">
                <option v-for="option in userTypeOptions" :key="option" :value="option">{{ option }}</option>
            </select>
            <select v-else-if="allSystems.includes(key)" v-model="editableRow[key]" class="table__modal-input">
                <option :value="0">0</option>
                <option :value="1">1</option>
            </select>

            <textarea v-else v-model="editableRow[key]" class="table__modal-input" rows="1"
                :readonly="['department_name', 'position_name', 'id'].includes(key)"></textarea>
        </div>
    </form>
</template>

<script>
export default {
    props: {
        editableRow: Object,
        userTypeOptions: Array,
        allSystems: Array
    },
    methods: {
    }
}
</script>

<style></style>