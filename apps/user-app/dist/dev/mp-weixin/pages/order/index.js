"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_order = require("../../api/order.js");
const constants_index = require("../../constants/index.js");
const utils_index = require("../../utils/index.js");
const pageSize = 10;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const tabs = [
      { label: "全部", value: -1 },
      { label: "待支付", value: constants_index.ORDER_STATUS.PENDING },
      { label: "充电中", value: constants_index.ORDER_STATUS.CHARGING },
      { label: "已完成", value: constants_index.ORDER_STATUS.COMPLETED }
    ];
    const currentTab = common_vendor.ref(-1);
    const orders = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const finished = common_vendor.ref(false);
    const page = common_vendor.ref(1);
    common_vendor.onMounted(() => {
      fetchOrders();
    });
    common_vendor.onShow(() => {
      onRefresh();
    });
    async function fetchOrders(isRefresh = false) {
      if (loading.value) return;
      loading.value = true;
      try {
        const params = {
          status: currentTab.value === -1 ? void 0 : currentTab.value,
          page: isRefresh ? 1 : page.value,
          pageSize
        };
        const res = await api_order.orderApi.getOrderList(params);
        if (isRefresh) {
          orders.value = res.list;
          page.value = 1;
        } else {
          orders.value = [...orders.value, ...res.list];
        }
        finished.value = orders.value.length >= res.total;
        page.value++;
      } catch (error) {
        console.error("获取订单失败", error);
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    }
    function handleTabChange(value) {
      if (currentTab.value === value) return;
      currentTab.value = value;
      orders.value = [];
      page.value = 1;
      finished.value = false;
      fetchOrders(true);
    }
    async function onRefresh() {
      refreshing.value = true;
      finished.value = false;
      await fetchOrders(true);
    }
    function onLoadMore() {
      if (!finished.value && !loading.value) {
        fetchOrders();
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
        case constants_index.ORDER_STATUS.CANCELLED:
        case constants_index.ORDER_STATUS.REFUNDED:
          return "gray";
        default:
          return "";
      }
    }
    function getStatusText(status) {
      return constants_index.ORDER_STATUS_TEXT[status] || "未知";
    }
    function goToDetail(orderNo) {
      common_vendor.index.navigateTo({ url: `${constants_index.PAGE_PATH.ORDER_DETAIL}?orderNo=${orderNo}` });
    }
    function handleCancel(orderNo) {
      common_vendor.index.showModal({
        title: "确认取消",
        content: "确定要取消该订单吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_order.orderApi.cancelOrder(orderNo);
              common_vendor.index.showToast({ title: "取消成功", icon: "success" });
              onRefresh();
            } catch (error) {
              common_vendor.index.showToast({ title: "取消失败", icon: "none" });
            }
          }
        }
      });
    }
    async function handlePay(orderNo) {
      try {
        common_vendor.index.showLoading({ title: "正在发起支付..." });
        const res = await api_order.orderApi.payOrder({
          orderNo,
          payType: "balance"
        });
        common_vendor.index.hideLoading();
        if (res.success) {
          common_vendor.index.showToast({ title: "支付成功", icon: "success" });
          onRefresh();
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "支付失败", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(tabs, (tab, k0, i0) => {
          return {
            a: common_vendor.t(tab.label),
            b: tab.value,
            c: common_vendor.n({
              active: currentTab.value === tab.value
            }),
            d: common_vendor.o(($event) => handleTabChange(tab.value), tab.value)
          };
        }),
        b: loading.value && orders.value.length === 0
      }, loading.value && orders.value.length === 0 ? {} : orders.value.length === 0 ? {
        d: common_assets._imports_0
      } : common_vendor.e({
        e: common_vendor.f(orders.value, (order, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(order.stationName),
            b: common_vendor.t(getStatusText(order.status)),
            c: common_vendor.n(getStatusClass(order.status)),
            d: common_vendor.t(order.pileName),
            e: common_vendor.t(common_vendor.unref(utils_index.formatDate)(order.startTime)),
            f: order.electricity
          }, order.electricity ? {
            g: common_vendor.t(order.electricity.toFixed(2))
          } : {}, {
            h: common_vendor.t(order.totalAmount.toFixed(2)),
            i: order.status === common_vendor.unref(constants_index.ORDER_STATUS).PENDING
          }, order.status === common_vendor.unref(constants_index.ORDER_STATUS).PENDING ? {
            j: common_vendor.o(($event) => handleCancel(order.orderNo), order.orderNo),
            k: common_vendor.o(($event) => handlePay(order.orderNo), order.orderNo)
          } : {}, {
            l: order.orderNo,
            m: common_vendor.o(($event) => goToDetail(order.orderNo), order.orderNo)
          });
        }),
        f: loading.value
      }, loading.value ? {} : {}, {
        g: finished.value && orders.value.length > 0
      }, finished.value && orders.value.length > 0 ? {} : {}), {
        c: orders.value.length === 0,
        h: refreshing.value,
        i: common_vendor.o(onRefresh, "3f"),
        j: common_vendor.o(onLoadMore, "a8")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a4b7abaf"]]);
wx.createPage(MiniProgramPage);
