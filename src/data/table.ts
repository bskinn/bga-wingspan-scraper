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

export const getIds = (): Array<string> => {
  // Scrape the player IDs out of the page
  const divs = [
    ...window.document.querySelectorAll('div[class="player-name"]'),
  ] as Array<HTMLDivElement>

  return divs.map((s) => s.id.split('_')[2])
}

export const getNames = (): Array<string> => {
  // Scrape the player names out of the page
  const playerIds = getIds()

  return playerIds.map((pid) => {
    const div = window.document.querySelector(
      `div[id$="${pid}"][class="player-name"]`,
    ) as HTMLDivElement

    if (div != null) {
      if (div.textContent) {
        return div.textContent.trim()
      } else {
        const errMsg = `Empty name string found for player ID '${pid}'`
        alert(errMsg)
        throw errMsg
      }
    } else {
      const errMsg = `Player name div not found for player ID '${pid}'`
      alert(errMsg)
      throw errMsg
    }
  })
}

export const getColors = (): Array<string> => {
  const playerIds = getIds()

  return playerIds.map((pid) => {
    let div = window.document.querySelector(
      `div[id$="${pid}"][class="player-name"]`,
    ) as HTMLDivElement

    if (div == null) {
      const errMsg = `Player colored name div not found for player ID '${pid}'`
      alert(errMsg)
      throw errMsg
    }

    let anchors = Array.from(div.children).filter((el) => {
      const target = el.getAttribute('target')
      return target && target == '_blank'
    }) as Array<HTMLAnchorElement>

    if (anchors.length < 1) {
      const errMsg = `No suitable anchor element for color determination for player ID '${pid}'`
      alert(errMsg)
      throw errMsg
    }

    let mch = anchors[0].style.color.match(/rgb\((\d+), (\d+), (\d+)\)/)

    if (mch == null) {
      const errMsg = `Color style information not found for player ID ${pid}`
      alert(errMsg)
      throw errMsg
    }

    let color = (
      65536 * parseInt(mch[1]) +
      256 * parseInt(mch[2]) +
      parseInt(mch[3])
    )
      .toString(16)
      .toUpperCase()

    return '#' + '0'.repeat(6 - color.length) + color
  })
}

export const numPlayers = (): number => {
  return getNames().length
}
