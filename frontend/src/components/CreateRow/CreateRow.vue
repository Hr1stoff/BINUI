<template>
    <section class="create-row">
        <div class="create-row__wrapper">
            <div class="create-row__header">
                <div class="create-row__title-wrap">
                    <span class="create-row__title">
                        Добавление новых данных в:
                    </span>
                    <select class="create-row__select" v-model="chosenNameTable" @change="getStructureTable">
                        <option class="create-row__option" v-for="(table, index) in filteredTables" :key="index"
                            :value="table">
                            {{ table }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="create-row__content">
                <!-- Создание строки для Access Right -->
                <CreateAccessRightRow v-if="chosenNameTable === 'access_rights'" ref="formComponent" :token="token"
                    :departments="departments" :systems="systems" :typeUserType="typeUserType" :position="position"
                    @submitForm="handleFormAccessSubmit" />

                <!-- Создание строки для Отделов, Должности и Системы -->
                <CreateRowOther v-else-if="['departments', 'position', 'systems'].includes(chosenNameTable)"
                    :token="token" :structureTable="structureTable" @submitForm="handleFormOtherSubmit"
                    ref="formComponent" />

                <!-- Создание строк для Новых атрибутов в систему -->
                <CreateRowAOS v-else-if="chosenNameTable === 'system_attributes'" :token="token"
                    :structureTable="structureTable" :systems="systems" @submitForm="handleFormAOSSubmit"
                    ref="formComponent" />

                <div class="create-row__buttons">
                    <button class="create-row__btn create-row__btn_send" @click="sendForm">
                        Отправить
                    </button>
                    <button class="create-row__btn create-row__btn_close" @click="$emit('closeCreateWindow')">
                        Отмена
                    </button>
                </div>
            </div>
        </div>

        <!-- Уведомление -->
        <Notification v-if="activateNotification" :message="notificationMessage" :type="notificationType"
            :duration="3000" />
       

    </section>
</template>


<script>
import Notification from '@/components/Notification.vue';
import CreateAccessRightRow from '@/components/CreateRow/CreateAccessRightRow.vue';
import CreateRowOther from '@/components/CreateRow/CreateRowOther.vue';
import CreateRowAOS from '@/components/CreateRow/CreateRowAOS.vue';
import api from '@/services/api';

export default {
    emits: ['closeCreateWindow'],
    inject: ['getTableData'],
    props: {
        selectedTable: { type: String },
        localTables: { type: Array, required: true },
    },
    components: {
        CreateAccessRightRow,
        CreateRowOther,
        CreateRowAOS,
        Notification,
    },
    data() {
        return {
            token: localStorage.getItem('accessToken'),
            chosenNameTable: '',
            formData: [],
            departments: [],
            position: [],
            systems: [],
            typeUserType: [],
            structureTable: [],
            activateNotification: false,
            notificationMessage: '',
            notificationType: 'info',
        };
    },
    created() {
        this.getTypeField();
    },
    mounted() {
        this.getFields();
        this.firstChoice();
        this.getStructureTable();
    },
    methods: {
        firstChoice() {
            if (this.selectedTable) {
                this.chosenNameTable = this.selectedTable;
            }
        },
        async getFields() {
            try {
                const fields = ['departments', 'systems', 'position'];
                for (let field of fields) {
                    const response = await api.get(`/${field}`, {
                        headers: { Authorization: `Bearer ${this.token}` }
                    });
                    this[field] = response.data.data;
                }
            } catch (err) {
                this.showNotification(err.response.data.message, 'error');
            }
        },
        async getTypeField() {
            try {
                const response = await api.get('/tables/getUserTypeOptions', {
                    headers: { Authorization: `Bearer ${this.token}` }
                });
                this.typeUserType = response.data.data;
            } catch (err) {
                this.showNotification(err.response.data.message, 'error');
            }
        },
        async getStructureTable() {
            if (this.chosenNameTable !== 'access_rights') {
                try {
                    const response = await api.get(`/tables/${this.chosenNameTable}/structure`, {
                        headers: { Authorization: `Bearer ${this.token}` }
                    });
                    this.structureTable = response.data.data;
                } catch (err) {
                    this.showNotification(err.response.data.message, 'error');
                }
            }
        },
        async sendForm() {
            this.formData = this.$refs.formComponent.getFormData();

            if (this.chosenNameTable === 'access_rights') {
                this.handleFormAccessSubmit(formData);
            } else if (['departments', 'position', 'systems'].includes(this.chosenNameTable)) {
                this.handleFormOtherSubmit();
            } else if (this.chosenNameTable === 'system_attributes') {
                this.handleFormAOSSubmit();
            }
            this.getTableData();
        },
        async handleFormAccessSubmit(formData) {
            try {
                const response = await api.post('/access_rights',
                    {
                        department_id: formData.department_id,
                        position_id: formData.position_id,
                        systems: formData.systems,
                        user_type: formData.user_type
                    },
                    {
                        headers: { Authorization: `Bearer ${this.token}` }
                    });

                this.showNotification(response.data.message, response.status === 201 ? 'success' : 'info');
                setTimeout(() => {
                    this.$emit('closeCreateWindow');
                }, 3000);
            } catch (err) {
                this.showNotification(err.response.data.message, 'error');
            }
        },
        async handleFormOtherSubmit() {
            for (let i = 0; i < this.formData.length; i++) {
                const attribute = this.formData[i];
                try {
                    const response = await api.post(`/${this.chosenNameTable}`,
                        {
                            name: attribute.name
                        },
                        {
                            headers: { Authorization: `Bearer ${this.token}` }
                        });
                    this.showNotification(response.data.message, response.status === 201 ? 'success' : 'info');
                    setTimeout(() => {
                        this.$emit('closeCreateWindow');
                    }, 3000);
                }
                catch (err) {
                    this.showNotification(err.response.data.message, 'error');
                }

            }

        },
        async handleFormAOSSubmit() {
            if (this.chosenNameTable === 'system_attributes') {
                for (let i = 0; i < this.formData.length; i++) {
                    const attribute = this.formData[i];
                    try {
                        const response = await api.post(`/${this.chosenNameTable}`,
                            {
                                systemId: attribute.system_id,
                                name: attribute.name,
                                value: attribute.value
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${this.token}`
                                }
                            }
                        );
                        this.showNotification(response.data.message, response.status === 201 ? 'success' : 'info');
                        setTimeout(() => {
                            this.$emit('closeCreateWindow');
                        }, 3000);
                    } catch (err) {
                        this.showNotification(err.response.data.message, 'error');
                    }
                }
            }
        },
        showNotification(message, type) {
            this.notificationMessage = message;
            this.notificationType = type;
            this.activateNotification = true;

            this.$nextTick(() => {
                setTimeout(() => {
                    this.activateNotification = false;
                }, 3000);
            });
        }

    },
    computed: {
        filteredTables() {
            return this.localTables.filter(table =>
                !['logs', 'open_in_systems', 'users', 'access_rights_attr'].includes(table)
            );
        }
    }
};
</script>


<style></style>