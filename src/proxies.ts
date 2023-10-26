export const createArrayCycleProxy = (arr: Array<Object>): Array<Object> => {
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
