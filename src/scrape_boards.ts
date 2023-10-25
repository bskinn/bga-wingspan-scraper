import {
  BOARD_LOCATION_IDS,
  BOARD_LOCATION_DESCRIPTIONS,
  NO_BIRD_ID,
  ROUND_BONUS_SCORES,
} from './consts'
import * as enums from './enums'

import type { TPixelValues } from './types_misc'

// ======  HELPER FUNCTIONS  ======

const getXYPixelValues = (xyString: string): TPixelValues => {
  const mch = xyString.match(/(-?\d+)px\s+(-?\d+)px/)

  if (mch === null) {
    const errMsg = `Regex failed to match in getXYPixelValues on string:\n\n${xyString}`
    alert(errMsg)
    throw errMsg
  }

  return { x: parseFloat(mch[1]), y: parseFloat(mch[2]) }
}

const calcCardIndex = (
  div: HTMLDivElement,
  numCols: number,
  numRows: number,
) => {
  // Calculate the 1-D index of a card from the given div
  // Assumes row-major order
  const resizeData = getComputedStyle(div).backgroundSize
  const offsetData = getComputedStyle(div).backgroundPosition

  const resizeXY = getXYPixelValues(resizeData)
  const offsetXY = getXYPixelValues(offsetData)

  const xOffset = Math.round((-1 * numCols * offsetXY.x) / resizeXY.x)
  const yOffset = Math.round((-1 * numRows * offsetXY.y) / resizeXY.y)

  return xOffset + numCols * yOffset
}

// ======  BIRD IDENTIFICATION  ======

const calcBirdIndex = (div: HTMLDivElement): number => {
  return calcCardIndex(div, 16, 11)
}

const getBoardBirdIndex = (player: string, loc: number): number => {
  // Store at the per-card, per-turn JSON scope
  const divId = `bird_img_${player}_${loc}`
  const div = window.document.querySelectorAll(
    `div[id="${divId}"]`,
  )[0] as HTMLDivElement

  if (div.classList.contains('wsp_hidden')) {
    return NO_BIRD_ID
  }

  return calcBirdIndex(div)
}

const getHandBirdsIndices = (): Array<number> => {
  // Store at the per-player, per-turn JSON scope
  const divArray: Array<HTMLDivElement> = [
    ...window.document.querySelectorAll('div[id^="handcard_bird_panel"]'),
  ] as Array<HTMLDivElement>
  return divArray.map((div) => calcBirdIndex(div))
}

// ======  EGG CALCULATION  ======

const calcEggCount = (player: string, loc: number) => {
  // Store at the per-card, per-turn JSON scope
  const eggDiv: HTMLDivElement = window.document.querySelector(
    `div[id="location_zone_${player}_${loc}"]`,
  ) as HTMLDivElement
  return eggDiv.children.length
}

// ======  TUCKED CARD CALCULATION  ======

const calcTuckCount = (player, loc) => {
  // Store at the per-card, per-turn JSON scope
  div = window.document.querySelectorAll(
    `div[id="tuckedcounter_${player}_${loc}"]`,
  )[0]

  return div ? parseInt(div.textContent) : 0
}

// ======  CACHED FOOD CALCULATION  ======

const calcCacheCount = (player, loc) => {
  // Store at the per-card, per-turn scope of JSON
  accum = 0
  divs = window.document.querySelectorAll(
    `div[id^="cachecounter_${player}_${loc}_"]`,
  )

  divs.forEach((div) => {
    accum += parseInt(div.textContent)
  })

  return accum
}

// ======  ROUND BONUS CALCULATION  ======

const getRoundBonusBoardSide = () => {
  // Store at the game-scope, one-time level
  const div = window.document.querySelector('div[id="goal_board_img"]')
  return getComputedStyle(div).backgroundPositionY == '0px' ? 'green' : 'blue'
}

const calcRoundBonusChipIndex = (div) => {
  return calcCardIndex(div, 4, 4)
}

const getRoundBonusChipIndices = () => {
  // Store at the game-scope, one-time level
  return rangeArray(4).map((idx) => {
    return calcRoundBonusChipIndex(
      window.document.querySelector(`div[id="goal_${idx}"]`),
    )
  })
}

// ======  PUBLIC API  ======

const printNameInfo = () => {
  getNames().forEach((n, i) => {
    console.log(`${n}: ${getIds()[i]}`)
  })
}
