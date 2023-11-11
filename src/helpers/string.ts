export const twoDigit = (val: number): string => {
  return val >= 10 ? `${val}` : `0${val}`
}

export const timestampFullShort = (): string => {
  const d = new Date()

  return `${d.getFullYear()}${twoDigit(d.getMonth() + 1)}${twoDigit(
    d.getDate(),
  )}_${twoDigit(d.getHours())}${twoDigit(d.getMinutes())}${twoDigit(
    d.getSeconds(),
  )}`
}
