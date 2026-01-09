"use strict";
const common_vendor = require("../../common/vendor.js");
const store_modules_user = require("../../store/modules/user.js");
const api_order = require("../../api/order.js");
const constants_index = require("../../constants/index.js");
const utils_index = require("../../utils/index.js");
const defaultAvatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23E8E8E8"/%3E%3Ccircle cx="50" cy="38" r="18" fill="%23BFBFBF"/%3E%3Cpath d="M20 85c0-16.569 13.431-30 30-30s30 13.431 30 30" fill="%23BFBFBF"/%3E%3C/svg%3E';
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = store_modules_user.useUserStore();
    const statusBarHeight = common_vendor.ref(0);
    const orderCount = common_vendor.ref(0);
    const totalElectricity = common_vendor.ref("0.0");
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 0;
    });
    common_vendor.onShow(() => {
      if (userStore.isLoggedIn) {
        userStore.fetchUserInfo();
        fetchStatistics();
      }
    });
    async function fetchStatistics() {
      try {
        const stats = await api_order.orderApi.getOrderStatistics();
        orderCount.value = stats.totalCount;
        totalElectricity.value = stats.totalElectricity.toFixed(1);
      } catch (error) {
        console.error("获取统计失败", error);
      }
    }
    function handleUserClick() {
      if (!userStore.isLoggedIn) {
        common_vendor.index.navigateTo({ url: constants_index.PAGE_PATH.LOGIN });
      } else {
        common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
      }
    }
    function goToWallet() {
      if (!userStore.checkLoginAndNavigate()) return;
      common_vendor.index.navigateTo({ url: constants_index.PAGE_PATH.WALLET });
    }
    function goToOrders() {
      if (!userStore.checkLoginAndNavigate()) return;
      common_vendor.index.switchTab({ url: constants_index.PAGE_PATH.ORDER });
    }
    function goToStatistics() {
      if (!userStore.checkLoginAndNavigate()) return;
      common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
    }
    function handleFavorites() {
      if (!userStore.checkLoginAndNavigate()) return;
      common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
    }
    function handleCoupon() {
      if (!userStore.checkLoginAndNavigate()) return;
      common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
    }
    function handleInvoice() {
      if (!userStore.checkLoginAndNavigate()) return;
      common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
    }
    function handleVehicle() {
      if (!userStore.checkLoginAndNavigate()) return;
      common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
    }
    function goToFeedback() {
      common_vendor.index.navigateTo({ url: "/pages-sub/settings/feedback" });
    }
    function goToAbout() {
      common_vendor.index.navigateTo({ url: "/pages-sub/settings/about" });
    }
    function goToSettings() {
      common_vendor.index.navigateTo({ url: "/pages-sub/settings/index" });
    }
    function handleLogout() {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        confirmColor: "#1A1A1A",
        success: (res) => {
          if (res.confirm) {
            userStore.logout();
            common_vendor.index.showToast({ title: "已退出登录", icon: "success" });
          }
        }
      });
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: ((_a = common_vendor.unref(userStore).userInfo) == null ? void 0 : _a.avatar) || defaultAvatar,
        b: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? {} : {}, {
        c: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? {
        d: common_vendor.t(common_vendor.unref(userStore).displayName),
        e: common_vendor.t(((_b = common_vendor.unref(userStore).userInfo) == null ? void 0 : _b.cardType) || "普通会员"),
        f: common_vendor.t(common_vendor.unref(utils_index.maskPhone)(common_vendor.unref(userStore).phone))
      } : {}, {
        g: common_vendor.o(handleUserClick, "33"),
        h: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? {
        i: common_vendor.t(common_vendor.unref(userStore).balance.toFixed(2)),
        j: common_vendor.o(goToWallet, "d2"),
        k: common_vendor.t(orderCount.value),
        l: common_vendor.o(goToOrders, "37"),
        m: common_vendor.t(totalElectricity.value),
        n: common_vendor.o(goToStatistics, "12")
      } : {}, {
        o: statusBarHeight.value + "px",
        p: common_vendor.o(goToWallet, "a6"),
        q: common_vendor.o(goToOrders, "76"),
        r: common_vendor.o(handleFavorites, "46"),
        s: common_vendor.o(handleCoupon, "4e"),
        t: common_vendor.o(goToStatistics, "77"),
        v: common_vendor.o(handleInvoice, "c6"),
        w: common_vendor.o(handleVehicle, "95"),
        x: common_vendor.o(goToFeedback, "e3"),
        y: common_vendor.o(goToAbout, "2f"),
        z: common_vendor.o(goToSettings, "00"),
        A: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? {
        B: common_vendor.o(handleLogout, "cf")
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9023ef44"]]);
wx.createPage(MiniProgramPage);
