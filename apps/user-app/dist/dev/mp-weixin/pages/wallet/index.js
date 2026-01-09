"use strict";
const common_vendor = require("../../common/vendor.js");
const store_modules_user = require("../../store/modules/user.js");
const api_wallet = require("../../api/wallet.js");
const utils_index = require("../../utils/index.js");
const constants_index = require("../../constants/index.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = store_modules_user.useUserStore();
    const packages = common_vendor.ref([]);
    const recentRecords = common_vendor.ref([]);
    common_vendor.onMounted(() => {
      fetchPackages();
      fetchRecentRecords();
    });
    common_vendor.onShow(() => {
      userStore.fetchUserInfo();
    });
    async function fetchPackages() {
      try {
        packages.value = await api_wallet.walletApi.getRechargePackages();
      } catch {
        packages.value = [
          { id: 1, amount: 50, giftAmount: 0 },
          { id: 2, amount: 100, giftAmount: 5 },
          { id: 3, amount: 200, giftAmount: 15 },
          { id: 4, amount: 500, giftAmount: 50 }
        ];
      }
    }
    async function fetchRecentRecords() {
      try {
        const res = await api_wallet.walletApi.getConsumeRecords({ pageSize: 5 });
        recentRecords.value = res.list;
      } catch {
        recentRecords.value = [];
      }
    }
    function handlePackageClick(pkg) {
      common_vendor.index.navigateTo({ url: `${constants_index.PAGE_PATH.RECHARGE}?packageId=${pkg.id}` });
    }
    function goToRecharge() {
      common_vendor.index.navigateTo({ url: constants_index.PAGE_PATH.RECHARGE });
    }
    function goToRecords() {
      common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.t(common_vendor.unref(userStore).balance.toFixed(2)),
        b: (_a = common_vendor.unref(userStore).userInfo) == null ? void 0 : _a.memberCardNo
      }, ((_b = common_vendor.unref(userStore).userInfo) == null ? void 0 : _b.memberCardNo) ? {
        c: common_vendor.t(common_vendor.unref(userStore).userInfo.memberCardNo)
      } : {}, {
        d: common_vendor.o(goToRecharge, "76"),
        e: common_vendor.o(goToRecords, "f2"),
        f: common_vendor.f(packages.value, (pkg, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(pkg.amount),
            b: pkg.giftAmount > 0
          }, pkg.giftAmount > 0 ? {
            c: common_vendor.t(pkg.giftAmount)
          } : {}, {
            d: pkg.giftAmount > 0
          }, pkg.giftAmount > 0 ? {
            e: common_vendor.t(pkg.amount + pkg.giftAmount)
          } : {}, {
            f: pkg.id,
            g: common_vendor.o(($event) => handlePackageClick(pkg), pkg.id)
          });
        }),
        g: common_vendor.o(goToRecords, "66"),
        h: recentRecords.value.length === 0
      }, recentRecords.value.length === 0 ? {} : {
        i: common_vendor.f(recentRecords.value, (record, k0, i0) => {
          return {
            a: common_vendor.t(record.type),
            b: common_vendor.t(common_vendor.unref(utils_index.formatDate)(record.createTime, "MM-DD HH:mm")),
            c: common_vendor.t(record.amount.toFixed(2)),
            d: record.id
          };
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9914b066"]]);
wx.createPage(MiniProgramPage);
