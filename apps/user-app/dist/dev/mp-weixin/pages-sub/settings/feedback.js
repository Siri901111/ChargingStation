"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "feedback",
  setup(__props) {
    const typeOptions = ["功能建议", "系统问题", "充电问题", "支付问题", "其他"];
    const typeIndex = common_vendor.ref(0);
    const content = common_vendor.ref("");
    const contact = common_vendor.ref("");
    function handleTypeChange(e) {
      typeIndex.value = e.detail.value;
    }
    function handleSubmit() {
      if (!content.value.trim()) {
        common_vendor.index.showToast({ title: "请输入问题描述", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "提交中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "提交成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }, 1e3);
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(typeOptions[typeIndex.value] || "请选择"),
        b: typeIndex.value,
        c: typeOptions,
        d: common_vendor.o(handleTypeChange, "6e"),
        e: content.value,
        f: common_vendor.o(($event) => content.value = $event.detail.value, "5b"),
        g: common_vendor.t(content.value.length),
        h: contact.value,
        i: common_vendor.o(($event) => contact.value = $event.detail.value, "17"),
        j: common_vendor.o(handleSubmit, "8c")
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5415d7d4"]]);
wx.createPage(MiniProgramPage);
