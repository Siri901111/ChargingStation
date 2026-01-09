"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const store_modules_user = require("../../store/modules/user.js");
const hooks_useCountdown = require("../../hooks/useCountdown.js");
const api_user = require("../../api/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "login",
  setup(__props) {
    const userStore = store_modules_user.useUserStore();
    const countdown = hooks_useCountdown.useCountdown(60);
    const statusBarHeight = common_vendor.ref(0);
    const phone = common_vendor.ref("");
    const code = common_vendor.ref("");
    const agreed = common_vendor.ref(false);
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 0;
    });
    function handleClose() {
      common_vendor.index.navigateBack();
    }
    async function handleSendCode() {
      if (countdown.isCounting.value) return;
      if (!phone.value || phone.value.length !== 11) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      try {
        await api_user.userApi.sendCode({ phone: phone.value, type: "login" });
        countdown.start();
        common_vendor.index.showToast({ title: "验证码已发送", icon: "success" });
      } catch (error) {
        common_vendor.index.showToast({ title: "发送失败，请重试", icon: "none" });
      }
    }
    async function handleLogin() {
      if (!agreed.value) {
        common_vendor.index.showToast({ title: "请先同意用户协议", icon: "none" });
        return;
      }
      if (!phone.value || phone.value.length !== 11) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      if (!code.value || code.value.length !== 6) {
        common_vendor.index.showToast({ title: "请输入6位验证码", icon: "none" });
        return;
      }
      try {
        await userStore.loginByPhone(phone.value, code.value);
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.showToast({ title: "登录失败，请重试", icon: "none" });
      }
    }
    async function handleWechatLogin(e) {
      if (!agreed.value) {
        common_vendor.index.showToast({ title: "请先同意用户协议", icon: "none" });
        return;
      }
      if (e.detail.errMsg !== "getPhoneNumber:ok") {
        return;
      }
      try {
        await userStore.loginByWechat();
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.showToast({ title: "登录失败，请重试", icon: "none" });
      }
    }
    function openAgreement(type) {
      const url = type === "user" ? "/pages-sub/settings/agreement" : "/pages-sub/settings/privacy";
      common_vendor.index.navigateTo({ url });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleClose, "cb"),
        b: common_assets._imports_0$1,
        c: statusBarHeight.value + "px",
        d: phone.value,
        e: common_vendor.o(($event) => phone.value = $event.detail.value, "fa"),
        f: code.value,
        g: common_vendor.o(($event) => code.value = $event.detail.value, "e5"),
        h: common_vendor.t(common_vendor.unref(countdown).isCounting.value ? `${common_vendor.unref(countdown).count.value}s` : "获取验证码"),
        i: common_vendor.n({
          disabled: common_vendor.unref(countdown).isCounting.value
        }),
        j: common_vendor.o(handleSendCode, "9a"),
        k: common_vendor.o(handleLogin, "d6"),
        l: common_vendor.o(handleWechatLogin, "16"),
        m: agreed.value
      }, agreed.value ? {} : {}, {
        n: agreed.value ? 1 : "",
        o: common_vendor.o(($event) => agreed.value = !agreed.value, "94"),
        p: common_vendor.o(($event) => openAgreement("user"), "e3"),
        q: common_vendor.o(($event) => openAgreement("privacy"), "d8")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-744525eb"]]);
wx.createPage(MiniProgramPage);
