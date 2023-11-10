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

export const getScores = (): Array<number> => {
  // Store at the per-player, per-turn JSON scope
  const playerIds = getIds()

  return playerIds.map((pid) => {
    const span = window.document.querySelector(
      `span[id$="${pid}"][class^="player_score"]`,
    ) as HTMLSpanElement
    if (span != null) {
      const text = span.textContent

      if (text) {
        return parseInt(text.trim())
      } else {
        const errMsg = `Score span for player ID ${pid} is empty`
        alert(errMsg)
        throw errMsg
      }
    } else {
      const errMsg = `Score span not found player ID ${pid}`
      alert(errMsg)
      throw errMsg
    }
  })
}
