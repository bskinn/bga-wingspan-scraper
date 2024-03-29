import type { TScoreSet } from '@/types/types-score-scrape'

import { getIds, getNames } from './table'

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

export const   scrapeScoreSet = (): TScoreSet => {
  const results = { scores: getScores(), names: getNames() }
  return results.names.map((n, i) => {
    return { name: n, score: results.scores[i] }
  })
}

export const extractRoundBonusScore = (name: string, text: string) => {
  const match = text.match(
    new RegExp(`Action cubes.+?${name}.+?scor[^\\s]+\\s+(\\d+)\\s+point`),
  )

  if (match != null) {
    return parseInt(match[1])
  } else {
    const errMsg = `Player name "${name} not found in search text:\n\n${text}`
    alert(errMsg)
    throw errMsg
  }
}

export const extractBonusCardScore = (name: string, text: string) => {
  // Find all the instances of bonus card scores and sum them
  return [
    ...text.matchAll(
      new RegExp(
        `[A-Z][A-Za-z ]+?:\\s+${name}\\s+has \\d+ birds, scoring (\\d+)`,
        'g',
      ),
    ),
  ].reduce((accum, newMatch) => accum + parseInt(newMatch[1]), 0)
}
