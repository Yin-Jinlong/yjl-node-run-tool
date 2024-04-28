/**
 * 转换（耗时）时间（到字符串）
 * @param time 时间
 */
export function convertTime(time: number): string {
    let ms = Math.round(time % 1000)
    time = Math.floor(time / 1000)
    let s = time % 60
    time = Math.floor(time / 60)
    return time === 0 ? `${s}.${ms}s` : `${time}m${s}.${ms}s`
}
