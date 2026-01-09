"use strict";
const common_vendor = require("../../common/vendor.js");
const constants_index = require("../../constants/index.js");
const utils_storage = require("../../utils/storage.js");
const api_user = require("../../api/user.js");
const useUserStore = common_vendor.defineStore("user", () => {
  const token = common_vendor.ref("");
  const userInfo = common_vendor.ref(null);
  const isLoading = common_vendor.ref(false);
  const isLoggedIn = common_vendor.computed(() => !!token.value);
  const balance = common_vendor.computed(() => {
    var _a;
    return ((_a = userInfo.value) == null ? void 0 : _a.balance) ?? 0;
  });
  const phone = common_vendor.computed(() => {
    var _a;
    return ((_a = userInfo.value) == null ? void 0 : _a.phone) ?? "";
  });
  const displayName = common_vendor.computed(() => {
    var _a, _b;
    return ((_a = userInfo.value) == null ? void 0 : _a.name) || ((_b = userInfo.value) == null ? void 0 : _b.phone) || "用户";
  });
  function checkLoginStatus() {
    const savedToken = common_vendor.index.getStorageSync(constants_index.STORAGE_KEYS.TOKEN);
    const savedUserInfo = utils_storage.getStorage(constants_index.STORAGE_KEYS.USER_INFO);
    if (savedToken) {
      token.value = savedToken;
      userInfo.value = savedUserInfo || null;
    }
  }
  function setToken(newToken) {
    token.value = newToken;
    common_vendor.index.setStorageSync(constants_index.STORAGE_KEYS.TOKEN, newToken);
  }
  function setUserInfo(info) {
    userInfo.value = info;
    utils_storage.setStorage(constants_index.STORAGE_KEYS.USER_INFO, info);
  }
  async function loginByPhone(phone2, code) {
    isLoading.value = true;
    try {
      const res = await api_user.userApi.loginByPhone({ phone: phone2, code });
      setToken(res.token);
      setUserInfo(res.userInfo);
      return res;
    } finally {
      isLoading.value = false;
    }
  }
  async function loginByWechat() {
    isLoading.value = true;
    try {
      const loginRes = await new Promise((resolve, reject) => {
        common_vendor.index.login({
          provider: "weixin",
          success: resolve,
          fail: reject
        });
      });
      if (!loginRes.code) {
        throw new Error("微信登录失败");
      }
      const res = await api_user.userApi.loginByWechat({ code: loginRes.code });
      setToken(res.token);
      if (res.userInfo) {
        setUserInfo(res.userInfo);
      }
      return res;
    } finally {
      isLoading.value = false;
    }
  }
  async function fetchUserInfo() {
    if (!token.value) return;
    try {
      const info = await api_user.userApi.getUserInfo();
      setUserInfo(info);
      return info;
    } catch (error) {
      console.error("获取用户信息失败", error);
    }
  }
  async function updateUserInfo(data) {
    const info = await api_user.userApi.updateUserInfo(data);
    setUserInfo({ ...userInfo.value, ...info });
    return info;
  }
  function logout() {
    token.value = "";
    userInfo.value = null;
    utils_storage.removeStorage(constants_index.STORAGE_KEYS.TOKEN);
    utils_storage.removeStorage(constants_index.STORAGE_KEYS.USER_INFO);
  }
  function checkLoginAndNavigate(callback) {
    if (!isLoggedIn.value) {
      common_vendor.index.navigateTo({ url: constants_index.PAGE_PATH.LOGIN });
      return false;
    }
    callback == null ? void 0 : callback();
    return true;
  }
  return {
    // State
    token,
    userInfo,
    isLoading,
    // Getters
    isLoggedIn,
    balance,
    phone,
    displayName,
    // Actions
    checkLoginStatus,
    setToken,
    setUserInfo,
    loginByPhone,
    loginByWechat,
    fetchUserInfo,
    updateUserInfo,
    logout,
    checkLoginAndNavigate
  };
});
exports.useUserStore = useUserStore;
