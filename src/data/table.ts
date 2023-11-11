export const getTableNum = (): string => {
  const search = window.location.search

  if (search !== null) {
    const match = search.match(/[?&]table=(\d+)(&|$)/)

    if (match != null) {
      return match[1]
    } else {
      const errMsg = `Table number not found in query parameters: "${search}"`
      alert(errMsg)
      throw errMsg
    }
  } else {
    const errMsg = `Current URL has no query parameters: "${window.location}"`
    alert(errMsg)
    throw errMsg
  }
}
