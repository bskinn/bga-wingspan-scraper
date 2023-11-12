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
export const getWinner = (): string => {
  const endDivs = [...window.document.querySelectorAll('div')].filter(
    (div) => div.textContent?.includes('The end of the game'),
  ) as Array<HTMLDivElement>

  if (endDivs.length < 1) {
    const errMsg = `No suitable divs found for retrieving winner name`
    alert(errMsg)
    throw errMsg
  }

  const endDiv = endDivs[0]

  if (endDiv.textContent == null) {
    const errMsg = `This should have been impossible, but no text was found in the winner-reporting div, despite it passing the initial filtering`
    alert(errMsg)
    throw errMsg
  }

  const endDivMatch = endDiv.textContent.match(
    /The end of the game: (.+?) wins!/,
  )

  if (endDivMatch == null) {
    const errMsg = `Winner name could not be extracted from the end-game div`
    alert(errMsg)
    throw errMsg
  }

  return endDivMatch[1]
}
