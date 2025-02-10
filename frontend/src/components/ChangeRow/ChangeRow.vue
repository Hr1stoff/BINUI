<template>
    <div class="table__modal">
        <div class="table__modal-wrapper">
            <h3 class="table__modal-title">Редактирование строки</h3>
            <div class="table__modal-content">
                <ChangeRowAccessRights v-if="selectedTable == 'access_rights'" :editableRow="editableRow"
                    :userTypeOptions="userTypeOptions" :allSystems="allSystems" />
                
                <div class="table__modal-buttons">
                    <button class="table__modal-btn table__modal-btn_safe" @click="sendEdit">Сохранить</button>
                    <button type="button" class="table__modal-btn table__modal-btn_cancel"
                        @click="closeEditWindow">Отменить</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ChangeRowAccessRights from '@/components/ChangeRow/ChangeRowAccessRights.vue';
export default {
    props: {
        selectedTable: String,
        editableRow: Object,
        userTypeOptions: Array,
        allSystems: Array
    },
    components: {
        ChangeRowAccessRights
    },
    emits: ["close", "save"],
    methods: {
        closeEditWindow() {
            this.$emit("close");
        },
        sendEdit() {
            this.$emit("save", this.editableRow);
        }
    }
};
</script>

<style></style>