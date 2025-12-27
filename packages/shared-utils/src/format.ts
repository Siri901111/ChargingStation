/**
 * 数字格式化为千分位
 * @param num 数字
 * @returns 格式化后的字符串
 */
export function toThousands(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  return n.toLocaleString('zh-CN');
}

/**
 * 格式化金额
 * @param amount 金额（分）
 * @returns 格式化后的金额字符串（元）
 */
export function formatAmount(amount: number): string {
  return (amount / 100).toFixed(2);
}

/**
 * 格式化百分比
 * @param value 小数值
 * @param decimals 小数位数
 * @returns 百分比字符串
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
