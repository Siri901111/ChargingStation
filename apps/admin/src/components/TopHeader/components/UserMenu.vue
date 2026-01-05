<template>
    <div class="user-section">
        <el-avatar :src="userAvatar" :size="32" class="user-avatar">
            <el-icon :size="16"><User /></el-icon>
        </el-avatar>
        <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-dropdown">
                {{ displayName }}
                <el-icon :size="14"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item icon="User" command="user">{{ t('header.userCenter') }}</el-dropdown-item>
                    <el-dropdown-item icon="Setting" command="setting">{{ t('header.systemSettings') }}</el-dropdown-item>
                    <el-dropdown-item divided icon="SwitchButton" command="logout">{{ t('header.logout') }}</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/auth'
import { getPersonalInfoApi } from '@/api/personal'
import { User, ArrowDown } from '@element-plus/icons-vue'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const { username } = storeToRefs(userStore)

const userAvatar = ref('')
const displayName = ref(username.value || t('common.user'))

const loadPersonalInfo = async () => {
    try {
        const res = await getPersonalInfoApi()
        if (res.code === 200 && res.data) {
            userAvatar.value = res.data.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${res.data.id || 'default'}`
            displayName.value = res.data.name || username.value || t('common.user')
        }
    } catch {
        userAvatar.value = `https://api.dicebear.com/7.x/miniavs/svg?seed=${username.value || 'default'}`
    }
}

const handleCommand = (command: string) => {
    switch (command) {
        case 'user': router.push('/personal'); break
        case 'setting': router.push('/system'); break
        case 'logout':
            userStore.logout()
            router.push('/login')
            break
    }
}

onMounted(() => {
    loadPersonalInfo()
})
</script>

<style lang="less" scoped>
.user-section {
    display: flex;
    align-items: center;
    gap: 8px;
}

.user-avatar {
    cursor: pointer;
}

.user-dropdown {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    transition: color 0.2s;

    &:hover {
        color: var(--el-color-primary);
    }
}
</style>

