// Scraping things that decorate a given bird on the board

import type { TBoardLocationID } from '@/types/types-ids'

// @ts-expect-error
const calcEggCount = (playerId: string, loc: TBoardLocationID): number => {
  // Store at the per-card, per-turn JSON scope
  const eggDiv: HTMLDivElement = window.document.querySelector(
    `div[id="location_zone_${playerId}_${loc}"]`,
  ) as HTMLDivElement
  return eggDiv.children.length
}

// @ts-expect-error
const calcTuckCount = (playerId: string, loc: TBoardLocationID): number => {
  // Store at the per-card, per-turn JSON scope
  const div: HTMLDivElement = window.document.querySelector(
    `div[id="tuckedcounter_${playerId}_${loc}"]`,
  ) as HTMLDivElement

  return div ? parseInt(div.textContent || '0') : 0
}

// @ts-expect-error
const calcCacheCount = (playerId: string, loc: TBoardLocationID): number => {
  // Store at the per-card, per-turn scope of JSON
  var accum: number = 0
  const divArray: Array<HTMLDivElement> = [
    ...window.document.querySelectorAll(
      `div[id^="cachecounter_${playerId}_${loc}_"]`,
    ),
  ] as Array<HTMLDivElement>

  divArray.forEach((div) => {
    accum += parseInt(div.textContent || '0')
  })

  return accum
}
