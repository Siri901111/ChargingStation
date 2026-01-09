"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const constants_index = require("../../constants/index.js");
const utils_index = require("../../utils/index.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const orderNo = common_vendor.ref("");
    const order = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    common_vendor.onLoad((options) => {
      if (options == null ? void 0 : options.orderNo) {
        orderNo.value = options.orderNo;
      }
    });
    common_vendor.onMounted(() => {
      if (orderNo.value) {
        fetchOrderDetail();
      }
    });
    async function fetchOrderDetail() {
      loading.value = true;
      try {
        order.value = await api_order.orderApi.getOrderDetail(orderNo.value);
      } catch (error) {
        common_vendor.index.showToast({ title: "获取订单失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    function getStatusClass(status) {
      switch (status) {
        case constants_index.ORDER_STATUS.PENDING:
          return "warning";
        case constants_index.ORDER_STATUS.CHARGING:
          return "primary";
        case constants_index.ORDER_STATUS.COMPLETED:
          return "success";
        default:
          return "gray";
      }
    }
    function getStatusIcon(status) {
      switch (status) {
        case constants_index.ORDER_STATUS.PENDING:
          return "icon-clock";
        case constants_index.ORDER_STATUS.CHARGING:
          return "icon-charging";
        case constants_index.ORDER_STATUS.COMPLETED:
          return "icon-check-circle";
        case constants_index.ORDER_STATUS.CANCELLED:
          return "icon-close-circle";
        default:
          return "icon-info-circle";
      }
    }
    function getStatusText(status) {
      return constants_index.ORDER_STATUS_TEXT[status] || "未知";
    }
    function getPayTypeText(payType) {
      const map = {
        wechat: "微信支付",
        alipay: "支付宝",
        balance: "余额支付"
      };
      return map[payType] || payType;
    }
    function handleCopy(text) {
      utils_index.copyToClipboard(text);
    }
    function handleCancel() {
      common_vendor.index.showModal({
        title: "确认取消",
        content: "确定要取消该订单吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_order.orderApi.cancelOrder(orderNo.value);
              common_vendor.index.showToast({ title: "取消成功", icon: "success" });
              fetchOrderDetail();
            } catch (error) {
              common_vendor.index.showToast({ title: "取消失败", icon: "none" });
            }
          }
        }
      });
    }
    async function handlePay() {
      try {
        common_vendor.index.showLoading({ title: "正在发起支付..." });
        const res = await api_order.orderApi.payOrder({
          orderNo: orderNo.value,
          payType: "balance"
        });
        common_vendor.index.hideLoading();
        if (res.success) {
          common_vendor.index.showToast({ title: "支付成功", icon: "success" });
          fetchOrderDetail();
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "支付失败", icon: "none" });
      }
    }
    function handleInvoice() {
      common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
    }
    function handleRecharge() {
      if (order.value) {
        common_vendor.index.navigateTo({
          url: `${constants_index.PAGE_PATH.STATION_DETAIL}?id=${order.value.stationId}`
        });
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {} : order.value ? common_vendor.e({
        c: common_vendor.n(getStatusIcon(order.value.status)),
        d: common_vendor.t(getStatusText(order.value.status)),
        e: order.value.status === common_vendor.unref(constants_index.ORDER_STATUS).COMPLETED
      }, order.value.status === common_vendor.unref(constants_index.ORDER_STATUS).COMPLETED ? {
        f: common_vendor.t(common_vendor.unref(utils_index.formatDate)(order.value.endTime))
      } : {}, {
        g: common_vendor.n(getStatusClass(order.value.status)),
        h: common_vendor.t(order.value.stationName),
        i: common_vendor.t(order.value.pileName),
        j: common_vendor.t(common_vendor.unref(utils_index.formatDate)(order.value.startTime)),
        k: order.value.endTime
      }, order.value.endTime ? {
        l: common_vendor.t(common_vendor.unref(utils_index.formatDate)(order.value.endTime))
      } : {}, {
        m: order.value.duration
      }, order.value.duration ? {
        n: common_vendor.t(common_vendor.unref(utils_index.formatDuration)(order.value.duration))
      } : {}, {
        o: order.value.electricity
      }, order.value.electricity ? {
        p: common_vendor.t(order.value.electricity.toFixed(2))
      } : {}, {
        q: order.value.electricityFee
      }, order.value.electricityFee ? {
        r: common_vendor.t(order.value.electricityFee.toFixed(2))
      } : {}, {
        s: order.value.serviceFee
      }, order.value.serviceFee ? {
        t: common_vendor.t(order.value.serviceFee.toFixed(2))
      } : {}, {
        v: order.value.parkingFee
      }, order.value.parkingFee ? {
        w: common_vendor.t(order.value.parkingFee.toFixed(2))
      } : {}, {
        x: common_vendor.t(order.value.totalAmount.toFixed(2)),
        y: common_vendor.t(order.value.orderNo),
        z: common_vendor.o(($event) => handleCopy(order.value.orderNo), "fb"),
        A: common_vendor.t(common_vendor.unref(utils_index.formatDate)(order.value.createTime)),
        B: order.value.payType
      }, order.value.payType ? {
        C: common_vendor.t(getPayTypeText(order.value.payType))
      } : {}, {
        D: order.value.payTime
      }, order.value.payTime ? {
        E: common_vendor.t(common_vendor.unref(utils_index.formatDate)(order.value.payTime))
      } : {}, {
        F: order.value.status === common_vendor.unref(constants_index.ORDER_STATUS).PENDING
      }, order.value.status === common_vendor.unref(constants_index.ORDER_STATUS).PENDING ? {
        G: common_vendor.o(handleCancel, "13"),
        H: common_vendor.o(handlePay, "0b")
      } : order.value.status === common_vendor.unref(constants_index.ORDER_STATUS).COMPLETED ? {
        J: common_vendor.o(handleInvoice, "b7"),
        K: common_vendor.o(handleRecharge, "08")
      } : {}, {
        I: order.value.status === common_vendor.unref(constants_index.ORDER_STATUS).COMPLETED
      }) : {}, {
        b: order.value
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5511cfa9"]]);
wx.createPage(MiniProgramPage);
