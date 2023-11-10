export const rangeArray = (len: number, start = 0, step = 1): Array<number> => {
  return Array.from(Array(len).keys(), (k) => start + step * k)
}
