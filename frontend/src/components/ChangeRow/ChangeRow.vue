<template>
    <div class="table__modal">
        <div class="table__modal-wrapper">
            <h3 class="table__modal-title">Редактирование строки</h3>
            <div class="table__modal-content">
                <ChangeRowAccessRights v-if="selectedTable == 'access_rights'" :editableRow="editableRow"
                    :userTypeOptions="userTypeOptions" :allSystems="allSystems" />

                <div class="table__modal-buttons">
                    <button class="table__modal-btn table__modal-btn_safe" >Сохранить</button>
                    <button type="button" class="table__modal-btn table__modal-btn_cancel" @click="closeEditWindow">Отменить</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ChangeRowAccessRights from '@/components/ChangeRow/ChangeRowAccessRights.vue';
import api from '@/services/api';

export default {
    props: {
        selectedTable: String,
        allSystems: Array,
    },
    components: {
        ChangeRowAccessRights
    },
    data() {
        return {
            userTypeOptions: [],
            editableRow: {},
            token: localStorage.getItem('accessToken'),
        }
    },
    emits: ["close", "save"],
    mounted(){
        this.getUserType()
    },
    methods: {
        closeEditWindow() {
            this.$emit("close");
        },
        // sendEdit() {
        //     this.$emit("save", this.editableRow);
        // },
        async getUserType() {
            try {
                const response = await api.get('/tables/getUserTypeOptions', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                });
                this.userTypeOptions = response.data.data;
            }
            catch (err) {

            }
        }

    }
};
</script>

<style></style>