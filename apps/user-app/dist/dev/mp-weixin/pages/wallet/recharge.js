"use strict";
const common_vendor = require("../../common/vendor.js");
const api_wallet = require("../../api/wallet.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "recharge",
  setup(__props) {
    const packages = common_vendor.ref([]);
    const selectedPackage = common_vendor.ref(null);
    const customAmount = common_vendor.ref("");
    const payType = common_vendor.ref("wechat");
    const totalAmount = common_vendor.computed(() => {
      if (selectedPackage.value) {
        return selectedPackage.value.amount;
      }
      return customAmount.value ? parseFloat(customAmount.value) : 0;
    });
    common_vendor.onMounted(() => {
      fetchPackages();
    });
    async function fetchPackages() {
      try {
        packages.value = await api_wallet.walletApi.getRechargePackages();
        if (packages.value.length > 0) {
          selectedPackage.value = packages.value[0];
        }
      } catch (error) {
        packages.value = [
          { id: 1, amount: 50, giftAmount: 0 },
          { id: 2, amount: 100, giftAmount: 5 },
          { id: 3, amount: 200, giftAmount: 15 },
          { id: 4, amount: 500, giftAmount: 50 }
        ];
        selectedPackage.value = packages.value[0];
      }
    }
    function handleSelectPackage(pkg) {
      selectedPackage.value = pkg;
      customAmount.value = "";
    }
    async function handleRecharge() {
      var _a;
      if (totalAmount.value <= 0) {
        common_vendor.index.showToast({ title: "请选择或输入充值金额", icon: "none" });
        return;
      }
      if (totalAmount.value < 10) {
        common_vendor.index.showToast({ title: "最低充值10元", icon: "none" });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "正在发起支付..." });
        const res = await api_wallet.walletApi.recharge({
          amount: totalAmount.value,
          packageId: (_a = selectedPackage.value) == null ? void 0 : _a.id,
          payType: payType.value
        });
        common_vendor.index.hideLoading();
        if (payType.value === "wechat" && res.payInfo) {
          common_vendor.index.requestPayment({
            ...res.payInfo,
            success: () => {
              common_vendor.index.showToast({ title: "充值成功", icon: "success" });
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1500);
            },
            fail: () => {
              common_vendor.index.showToast({ title: "支付取消", icon: "none" });
            }
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "充值失败，请重试", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(packages.value, (pkg, k0, i0) => {
          var _a;
          return common_vendor.e({
            a: common_vendor.t(pkg.amount),
            b: pkg.giftAmount > 0
          }, pkg.giftAmount > 0 ? {
            c: common_vendor.t(pkg.giftAmount)
          } : {}, {
            d: pkg.id,
            e: common_vendor.n({
              active: ((_a = selectedPackage.value) == null ? void 0 : _a.id) === pkg.id
            }),
            f: common_vendor.o(($event) => handleSelectPackage(pkg), pkg.id)
          });
        }),
        b: common_vendor.o(($event) => selectedPackage.value = null, "c3"),
        c: customAmount.value,
        d: common_vendor.o(($event) => customAmount.value = $event.detail.value, "75"),
        e: payType.value === "wechat"
      }, payType.value === "wechat" ? {} : {}, {
        f: common_vendor.n({
          active: payType.value === "wechat"
        }),
        g: common_vendor.o(($event) => payType.value = "wechat", "f1"),
        h: payType.value === "alipay"
      }, payType.value === "alipay" ? {} : {}, {
        i: common_vendor.n({
          active: payType.value === "alipay"
        }),
        j: common_vendor.o(($event) => payType.value = "alipay", "2a"),
        k: common_vendor.t(totalAmount.value),
        l: common_vendor.o(handleRecharge, "08")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f95de024"]]);
wx.createPage(MiniProgramPage);
