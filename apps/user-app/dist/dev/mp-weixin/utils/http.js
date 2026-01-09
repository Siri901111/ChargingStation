"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const common_vendor = require("../common/vendor.js");
const config_index = require("../config/index.js");
const constants_index = require("../constants/index.js");
const store_modules_user = require("../store/modules/user.js");
class HttpRequest {
  constructor(baseUrl) {
    __publicField(this, "baseUrl");
    this.baseUrl = baseUrl;
  }
  /**
   * 获取请求头
   */
  getHeaders() {
    const headers = {
      "Content-Type": "application/json"
    };
    const token = common_vendor.index.getStorageSync(constants_index.STORAGE_KEYS.TOKEN);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }
  /**
   * 请求拦截
   */
  requestInterceptor(options) {
    if (config_index.config.debug) {
      console.log(`[Request] ${options.method} ${options.url}`, options.data);
    }
    return options;
  }
  /**
   * 响应拦截
   */
  responseInterceptor(response) {
    const data = response.data;
    if (config_index.config.debug) {
      console.log("[Response]", data);
    }
    if (data.code !== 200 && data.code !== 0) {
      if (data.code === 401) {
        this.handleUnauthorized();
      }
      throw new Error(data.message || "请求失败");
    }
    return data;
  }
  /**
   * 处理未授权
   */
  handleUnauthorized() {
    const userStore = store_modules_user.useUserStore();
    userStore.logout();
    common_vendor.index.showToast({
      title: "登录已过期，请重新登录",
      icon: "none"
    });
    setTimeout(() => {
      common_vendor.index.navigateTo({
        url: "/pages-sub/auth/login"
      });
    }, 1500);
  }
  /**
   * 发送请求
   */
  async request(options) {
    const { url, method = "GET", data, header = {}, loading = true, loadingText = "加载中..." } = this.requestInterceptor(options);
    if (loading) {
      common_vendor.index.showLoading({ title: loadingText, mask: true });
    }
    try {
      const response = await new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: `${this.baseUrl}${url}`,
          method,
          data,
          header: {
            ...this.getHeaders(),
            ...header
          },
          success: resolve,
          fail: reject
        });
      });
      const result = this.responseInterceptor(response);
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "网络请求失败";
      common_vendor.index.showToast({
        title: message,
        icon: "none"
      });
      throw error;
    } finally {
      if (loading) {
        common_vendor.index.hideLoading();
      }
    }
  }
  /**
   * GET 请求
   */
  get(url, data, options) {
    return this.request({ url, method: "GET", data, ...options });
  }
  /**
   * POST 请求
   */
  post(url, data, options) {
    return this.request({ url, method: "POST", data, ...options });
  }
  /**
   * PUT 请求
   */
  put(url, data, options) {
    return this.request({ url, method: "PUT", data, ...options });
  }
  /**
   * DELETE 请求
   */
  delete(url, data, options) {
    return this.request({ url, method: "DELETE", data, ...options });
  }
}
const http = new HttpRequest(config_index.config.baseUrl);
exports.http = http;
