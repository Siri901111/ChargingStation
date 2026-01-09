"use strict";
const common_vendor = require("../../common/vendor.js");
const store_modules_user = require("../../store/modules/user.js");
const hooks_useCountdown = require("../../hooks/useCountdown.js");
const api_user = require("../../api/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "bindPhone",
  setup(__props) {
    const userStore = store_modules_user.useUserStore();
    const countdown = hooks_useCountdown.useCountdown(60);
    const phone = common_vendor.ref("");
    const code = common_vendor.ref("");
    async function handleSendCode() {
      if (countdown.isCounting.value) return;
      if (!phone.value || phone.value.length !== 11) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      try {
        await api_user.userApi.sendCode({ phone: phone.value, type: "bindPhone" });
        countdown.start();
        common_vendor.index.showToast({ title: "验证码已发送", icon: "success" });
      } catch (error) {
        common_vendor.index.showToast({ title: "发送失败，请重试", icon: "none" });
      }
    }
    async function handleBind() {
      if (!phone.value || phone.value.length !== 11) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      if (!code.value || code.value.length !== 6) {
        common_vendor.index.showToast({ title: "请输入6位验证码", icon: "none" });
        return;
      }
      try {
        const userInfo = await api_user.userApi.bindPhone({ phone: phone.value, code: code.value });
        userStore.setUserInfo(userInfo);
        common_vendor.index.showToast({ title: "绑定成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.showToast({ title: "绑定失败，请重试", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return {
        a: phone.value,
        b: common_vendor.o(($event) => phone.value = $event.detail.value, "68"),
        c: code.value,
        d: common_vendor.o(($event) => code.value = $event.detail.value, "8e"),
        e: common_vendor.t(common_vendor.unref(countdown).isCounting.value ? `${common_vendor.unref(countdown).count.value}s` : "获取验证码"),
        f: common_vendor.n({
          disabled: common_vendor.unref(countdown).isCounting.value
        }),
        g: common_vendor.o(handleSendCode, "4d"),
        h: common_vendor.o(handleBind, "c6")
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-09660f18"]]);
wx.createPage(MiniProgramPage);
