import type {
  TBirdId,
  TBoardLocationID,
  TPixelValues,
  TRoundBonusChipId,
} from './types/types_misc'

import { NO_BIRD_ID } from './consts'

import { getIds, getNames } from './data/player'

import { rangeArray } from './helpers/array'

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

const calcBirdId = (div: HTMLDivElement): TBirdId => {
  return calcCardIndex(div, 16, 11) as TBirdId
}

// @ts-expect-error
const getBoardBirdId = (player: string, loc: TBoardLocationID): TBirdId => {
  // Store at the per-card, per-turn JSON scope
  const divId = `bird_img_${player}_${loc}`
  const div = window.document.querySelectorAll(
    `div[id="${divId}"]`,
  )[0] as HTMLDivElement

  if (div.classList.contains('wsp_hidden')) {
    return NO_BIRD_ID
  }

  return calcBirdId(div)
}

// @ts-expect-error
const getHandBirdsIds = (): Array<TBirdId> => {
  // Store at the per-player, per-turn JSON scope
  const divArray: Array<HTMLDivElement> = [
    ...window.document.querySelectorAll('div[id^="handcard_bird_panel"]'),
  ] as Array<HTMLDivElement>
  return divArray.map((div) => calcBirdId(div))
}

// ======  EGG CALCULATION  ======

// @ts-expect-error
const calcEggCount = (playerId: string, loc: TBoardLocationID): number => {
  // Store at the per-card, per-turn JSON scope
  const eggDiv: HTMLDivElement = window.document.querySelector(
    `div[id="location_zone_${playerId}_${loc}"]`,
  ) as HTMLDivElement
  return eggDiv.children.length
}

// ======  TUCKED CARD CALCULATION  ======

// @ts-expect-error
const calcTuckCount = (playerId: string, loc: TBoardLocationID): number => {
  // Store at the per-card, per-turn JSON scope
  const div: HTMLDivElement = window.document.querySelector(
    `div[id="tuckedcounter_${playerId}_${loc}"]`,
  ) as HTMLDivElement

  return div ? parseInt(div.textContent || '0') : 0
}

// ======  CACHED FOOD CALCULATION  ======

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

// ======  ROUND BONUS CALCULATION  ======

// @ts-expect-error
const getRoundBonusBoardSide = () => {
  // Store at the game-scope, one-time level
  const div = window.document.querySelector(
    'div[id="goal_board_img"]',
  ) as HTMLDivElement
  return getComputedStyle(div).backgroundPositionY == '0px' ? 'green' : 'blue'
}

const calcRoundBonusChipIndex = (div: HTMLDivElement): TRoundBonusChipId => {
  return calcCardIndex(div, 4, 4) as TRoundBonusChipId
}

// @ts-expect-error
const getRoundBonusChipIndices = (): Array<TRoundBonusChipId> => {
  // Store at the game-scope, one-time level
  return rangeArray(4).map((idx) => {
    const div: HTMLDivElement = window.document.querySelector(
      `div[id="goal_${idx}"]`,
    ) as HTMLDivElement

    if (div === null) {
      const errMsg = `Failed to find round bonus chip div at index ${idx}`
      alert(errMsg)
      throw errMsg
    }

    return calcRoundBonusChipIndex(div)
  })
}

// ======  PUBLIC API  ======

export const printNameInfo = () => {
  getNames().forEach((n, i) => {
    console.log(`${n}: ${getIds()[i]}`)
  })
}
