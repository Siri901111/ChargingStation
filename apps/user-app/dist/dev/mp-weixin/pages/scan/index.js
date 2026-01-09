"use strict";
const common_vendor = require("../../common/vendor.js");
const store_modules_user = require("../../store/modules/user.js");
const store_modules_charging = require("../../store/modules/charging.js");
const api_charging = require("../../api/charging.js");
const constants_index = require("../../constants/index.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = store_modules_user.useUserStore();
    const chargingStore = store_modules_charging.useChargingStore();
    common_vendor.ref("");
    const pileInfo = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const canCharge = common_vendor.computed(() => {
      if (!pileInfo.value) return false;
      if (pileInfo.value.status !== constants_index.PILE_STATUS.FREE) return false;
      if (userStore.balance < 10) return false;
      return true;
    });
    const startBtnText = common_vendor.computed(() => {
      if (!pileInfo.value) return "扫码充电";
      if (pileInfo.value.status !== constants_index.PILE_STATUS.FREE) return "充电桩不可用";
      if (userStore.balance < 10) return "余额不足";
      return "开始充电";
    });
    common_vendor.onLoad((options) => {
      if (options == null ? void 0 : options.code) {
        handleQRCode(decodeURIComponent(options.code));
      }
    });
    common_vendor.onMounted(() => {
      if (userStore.isLoggedIn) {
        userStore.fetchUserInfo();
      }
    });
    async function handleQRCode(code) {
      loading.value = true;
      try {
        const result = await api_charging.chargingApi.scanPile(code);
        pileInfo.value = result;
      } catch (error) {
        common_vendor.index.showToast({
          title: "无效的充电桩二维码",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    }
    function handleScanCode(e) {
      handleQRCode(e.detail.result);
    }
    function getStatusClass(status) {
      switch (status) {
        case constants_index.PILE_STATUS.FREE:
          return "success";
        case constants_index.PILE_STATUS.CHARGING:
          return "warning";
        case constants_index.PILE_STATUS.FAULT:
        case constants_index.PILE_STATUS.OFFLINE:
          return "danger";
        default:
          return "";
      }
    }
    function getStatusText(status) {
      return constants_index.PILE_STATUS_TEXT[status] || "未知";
    }
    async function handleStartCharging() {
      if (!canCharge.value || !pileInfo.value) return;
      common_vendor.index.showModal({
        title: "确认开始充电",
        content: `即将在 ${pileInfo.value.pileName} 开始充电，当前电价 ¥${pileInfo.value.price}/度`,
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "正在启动..." });
              await chargingStore.startCharging(pileInfo.value.pileId);
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "充电已启动",
                icon: "success"
              });
              setTimeout(() => {
                common_vendor.index.redirectTo({ url: constants_index.PAGE_PATH.CHARGING });
              }, 1500);
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "启动失败，请重试",
                icon: "none"
              });
            }
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !pileInfo.value
      }, !pileInfo.value ? {
        b: common_vendor.o(handleScanCode, "b4")
      } : {
        c: common_vendor.t(pileInfo.value.pileName),
        d: common_vendor.t(pileInfo.value.stationName),
        e: common_vendor.t(getStatusText(pileInfo.value.status)),
        f: common_vendor.n(getStatusClass(pileInfo.value.status)),
        g: common_vendor.t(pileInfo.value.type === "fast" ? "快充" : "慢充"),
        h: common_vendor.t(pileInfo.value.power),
        i: common_vendor.t(pileInfo.value.price),
        j: common_vendor.t(common_vendor.unref(userStore).balance.toFixed(2)),
        k: common_vendor.t(startBtnText.value),
        l: common_vendor.n({
          "btn-disabled": !canCharge.value
        }),
        m: common_vendor.o(handleStartCharging, "b6")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-99526857"]]);
wx.createPage(MiniProgramPage);
