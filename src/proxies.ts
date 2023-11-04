export const createArrayCycleProxy = <T>(arr: Array<T>): Array<T> => {
  return new Proxy(arr, {
    get: (target, prop) => {
      if (typeof prop === 'symbol') {
        const errMsg = 'Symbol used to index an array-cycle Proxy'
        alert(errMsg)
        throw errMsg
      }
      return target[parseInt(prop) % arr.length]
    },
  })
}
