<template>
  <view class="page">
    <!-- 头像区域 -->
    <view class="avatar-section" @click="handleChangeAvatar">
      <view class="avatar-wrapper">
        <image
          class="avatar-img"
          :src="formData.avatar || defaultAvatar"
          mode="aspectFill"
        />
        <view class="avatar-edit">
          <text>编辑</text>
        </view>
      </view>
      <text class="avatar-tip">点击更换头像</text>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <view class="form-item" @click="handleEditName">
        <text class="form-label">昵称</text>
        <view class="form-value">
          <text>{{ formData.name || '未设置' }}</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="form-item" @click="handleSelectGender">
        <text class="form-label">性别</text>
        <view class="form-value">
          <text>{{ genderText }}</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <picker mode="date" :value="formData.birthday || '2000-01-01'" :end="today" @change="handleDateChange">
        <view class="form-item touchable">
          <text class="form-label">生日</text>
          <view class="form-value">
            <text>{{ formData.birthday ? formatBirthday(formData.birthday) : '未设置' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </picker>

      <view class="form-item">
        <text class="form-label">手机号</text>
        <view class="form-value">
          <text class="phone-text">{{ maskPhone(userStore.phone) }}</text>
        </view>
      </view>

      <view class="form-item" @click="goToMemberCard">
        <text class="form-label">会员卡</text>
        <view class="form-value">
          <text>{{ userStore.userInfo?.cardType || '普通会员' }}</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <view class="save-btn" :class="{ disabled: !hasChanges || saving }" @click="handleSave">
        <text>{{ saving ? '保存中...' : '保存修改' }}</text>
      </view>
    </view>

    <!-- 性别选择器 -->
    <view v-if="showGenderPicker" class="picker-mask" @click="showGenderPicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-cancel" @click="showGenderPicker = false">取消</text>
          <text class="picker-title">选择性别</text>
          <text class="picker-confirm" @click="confirmGender">确定</text>
        </view>
        <view class="picker-options">
          <view
            v-for="item in genderOptions"
            :key="item.value"
            :class="['picker-option', { active: tempGender === item.value }]"
            @click="tempGender = item.value"
          >
            <text>{{ item.label }}</text>
            <text v-if="tempGender === item.value" class="check-icon">✓</text>
          </view>
        </view>
      </view>
    </view>


    <!-- 昵称编辑弹窗 -->
    <view v-if="showNameEditor" class="picker-mask" @click="showNameEditor = false">
      <view class="name-editor" @click.stop>
        <view class="editor-header">
          <text class="editor-title">修改昵称</text>
        </view>
        <view class="editor-body">
          <input
            v-model="tempName"
            class="name-input"
            placeholder="请输入昵称"
            maxlength="20"
            focus
          />
        </view>
        <view class="editor-footer">
          <view class="editor-btn cancel" @click="showNameEditor = false">取消</view>
          <view class="editor-btn confirm" @click="confirmName">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { userApi } from '@/api/user'
import { maskPhone } from '@/utils'
import { PAGE_PATH } from '@/constants'

const userStore = useUserStore()

// 默认头像
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

// 表单数据
const formData = ref({
  name: '',
  avatar: '',
  gender: 0,
  birthday: '',
})

// 原始数据（用于比较是否有修改）
const originalData = ref({
  name: '',
  avatar: '',
  gender: 0,
  birthday: '',
})

// 状态
const saving = ref(false)
const showGenderPicker = ref(false)
const showNameEditor = ref(false)
const tempGender = ref(0)
const tempName = ref('')

// 性别选项
const genderOptions = [
  { value: 0, label: '保密' },
  { value: 1, label: '男' },
  { value: 2, label: '女' },
]

// 今天的日期
const today = new Date().toISOString().split('T')[0]

// 性别文本
const genderText = computed(() => {
  const option = genderOptions.find(o => o.value === formData.value.gender)
  return option?.label || '保密'
})

// 是否有修改
const hasChanges = computed(() => {
  return (
    formData.value.name !== originalData.value.name ||
    formData.value.avatar !== originalData.value.avatar ||
    formData.value.gender !== originalData.value.gender ||
    formData.value.birthday !== originalData.value.birthday
  )
})

// 初始化
onMounted(async () => {
  // 先获取最新用户信息
  try {
    await userStore.fetchUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
  
  const info = userStore.userInfo
  if (info) {
    formData.value = {
      name: info.name || '',
      avatar: info.avatar || '',
      gender: info.gender || 0,
      birthday: info.birthday || '',
    }
    originalData.value = { ...formData.value }
  }
})

// 选择性别
function handleSelectGender() {
  tempGender.value = formData.value.gender
  showGenderPicker.value = true
}


// 编辑昵称
function handleEditName() {
  tempName.value = formData.value.name
  showNameEditor.value = true
}

// 确认昵称
function confirmName() {
  formData.value.name = tempName.value.trim()
  showNameEditor.value = false
}

// 确认性别
function confirmGender() {
  formData.value.gender = tempGender.value
  showGenderPicker.value = false
}

// 格式化生日显示
function formatBirthday(dateStr: string): string {
  if (!dateStr) return ''
  try {
    // 处理YYYY-MM-DD格式
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`
  } catch {
    return dateStr
  }
}

// 选择日期
function handleDateChange(e: any) {
  if (e.detail?.value) {
    formData.value.birthday = e.detail.value
  }
}

// 更换头像
async function handleChangeAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      try {
        uni.showLoading({ title: '处理中...' })
        const filePath = res.tempFilePaths[0]
        
        // 压缩图片（如果太大）
        const compressRes = await new Promise<UniApp.CompressImageSuccessData>((resolve, reject) => {
          uni.compressImage({
            src: filePath,
            quality: 80,
            success: resolve,
            fail: reject,
          })
        }).catch(() => ({ tempFilePath: filePath }))
        
        // #ifdef H5
        // H5平台：将图片转换为base64
        const fs = uni.getFileSystemManager()
        const base64 = await new Promise<string>((resolve, reject) => {
          fs.readFile({
            filePath: compressRes.tempFilePath,
            encoding: 'base64',
            success: (fileRes: any) => {
              resolve('data:image/jpeg;base64,' + fileRes.data)
            },
            fail: reject,
          })
        })
        
        // 上传头像
        try {
          const updatedUser = await userApi.uploadAvatar(base64)
          formData.value.avatar = updatedUser.avatar || base64
          userStore.setUserInfo(updatedUser)
          uni.showToast({ title: '头像上传成功', icon: 'success' })
        } catch (error: any) {
          // 如果上传失败，仍然保存base64到本地显示
          formData.value.avatar = base64
          console.error('上传头像失败:', error)
          uni.showToast({ title: '头像已保存（上传失败）', icon: 'none' })
        }
        // #endif
        
        // #ifndef H5
        // 其他平台：直接使用临时路径（实际应该上传到服务器）
        // 在小程序等平台，可以使用uni.uploadFile上传
        formData.value.avatar = compressRes.tempFilePath
        uni.showToast({ title: '头像已选择', icon: 'success' })
        // #endif
        
        uni.hideLoading()
      } catch (error: any) {
        uni.hideLoading()
        console.error('处理图片失败:', error)
        uni.showToast({ title: error.message || '图片处理失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '选择图片失败', icon: 'none' })
    },
  })
}

// 跳转会员卡
function goToMemberCard() {
  if (!userStore.checkLoginAndNavigate()) return
  uni.navigateTo({ url: PAGE_PATH.MEMBER_CARD })
}

// 保存修改
async function handleSave() {
  if (!hasChanges.value || saving.value) return

  saving.value = true
  try {
    // 如果头像已更改且是base64，先上传头像
    let avatarUrl = formData.value.avatar
    if (formData.value.avatar !== originalData.value.avatar && formData.value.avatar.startsWith('data:image')) {
      try {
        const updatedUser = await userApi.uploadAvatar(formData.value.avatar)
        avatarUrl = updatedUser.avatar || formData.value.avatar
        userStore.setUserInfo(updatedUser)
      } catch (error) {
        console.error('上传头像失败，使用原头像:', error)
        // 如果上传失败，仍然保存其他信息
      }
    }
    
    // 更新用户信息
    const updatedInfo = await userStore.updateUserInfo({
      name: formData.value.name,
      avatar: avatarUrl,
      gender: formData.value.gender,
      birthday: formData.value.birthday,
    })
    
    originalData.value = { ...formData.value }
    originalData.value.avatar = avatarUrl
    formData.value.avatar = updatedInfo.avatar || avatarUrl
    
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error: any) {
    console.error('保存失败:', error)
    uni.showToast({ title: error.message || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #FAF9F7;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background: #FFFFFF;
  margin-bottom: 24rpx;
}

.avatar-wrapper {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 16rpx;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #F5F5F5;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0 0 80rpx 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #FFFFFF;
}

.avatar-tip {
  font-size: 24rpx;
  color: #999999;
}

/* 表单区域 */
.form-section {
  background: #FFFFFF;
  padding: 0 32rpx;
}

.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  font-size: 30rpx;
  color: #1A1A1A;
}

.form-value {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 30rpx;
  color: #999999;
}

.phone-text {
  color: #1A1A1A;
}

.arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}

/* 保存按钮 */
.save-section {
  padding: 60rpx 32rpx;
}

.save-btn {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1A1A1A;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  transition: all 0.2s;
}

.save-btn.disabled {
  background: #CCCCCC;
}

.save-btn:active:not(.disabled) {
  transform: scale(0.98);
  background: #333333;
}

/* 选择器遮罩 */
.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.picker-content {
  width: 100%;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.picker-cancel,
.picker-confirm {
  font-size: 30rpx;
  padding: 8rpx 16rpx;
}

.picker-cancel {
  color: #999999;
}

.picker-confirm {
  color: #1A1A1A;
  font-weight: 600;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.picker-options {
  padding: 16rpx 0;
}

.picker-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  font-size: 30rpx;
  color: #1A1A1A;
}

.picker-option.active {
  background: #FAFAFA;
}

.check-icon {
  color: #5A8F7B;
  font-weight: 600;
}

.picker-body {
  padding: 32rpx;
  min-height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.picker-value {
  font-size: 32rpx;
  color: #1A1A1A;
  font-weight: 500;
}

/* 昵称编辑弹窗 */
.name-editor {
  width: 600rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 200rpx;
}

.editor-header {
  padding: 32rpx;
  text-align: center;
  border-bottom: 1rpx solid #F0F0F0;
}

.editor-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.editor-body {
  padding: 32rpx;
}

.name-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: #F5F5F5;
  border-radius: 16rpx;
  font-size: 30rpx;
}

.editor-footer {
  display: flex;
  border-top: 1rpx solid #F0F0F0;
}

.editor-btn {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}

.editor-btn.cancel {
  color: #999999;
  border-right: 1rpx solid #F0F0F0;
}

.editor-btn.confirm {
  color: #1A1A1A;
  font-weight: 600;
}
</style>
