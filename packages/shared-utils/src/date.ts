/**
 * 日期时间工具函数
 */

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param format 格式字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | number | string,
  format = 'YYYY-MM-DD HH:mm:ss'
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const pad = (n: number) => n.toString().padStart(2, '0');

  const replacements: Record<string, string> = {
    YYYY: d.getFullYear().toString(),
    MM: pad(d.getMonth() + 1),
    DD: pad(d.getDate()),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
    ss: pad(d.getSeconds()),
  };

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => replacements[match] || match);
}

/**
 * 获取相对时间描述
 * @param date 日期
 * @returns 相对时间字符串
 */
export function getRelativeTime(date: Date | number | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}
