import {
  BOARD_LOCATION_IDS,
  BOARD_LOCATION_DESCRIPTIONS,
  NO_BIRD_ID,
  ROUND_BONUS_SCORES,
} from './consts'
import * as enums from './enums'

// ======  HELPER FUNCTIONS  ======

const getXYPixelValues = (xyString) => {
  mch = xyString.match(/(-?\d+)px\s+(-?\d+)px/)
  return { x: mch[1], y: mch[2] }
}

const calcCardIndex = (div, numCols, numRows) => {
  // Calculate the 1-D index of a card from the given div
  // Assumes row-major order
  resizeData = getComputedStyle(div)['background-size']
  offsetData = getComputedStyle(div)['background-position']

  resizeXY = getXYPixelValues(resizeData)
  offsetXY = getXYPixelValues(offsetData)

  xOffset = Math.round(
    (-1 * numCols * parseInt(offsetXY.x)) / parseInt(resizeXY.x),
  )
  yOffset = Math.round(
    (-1 * numRows * parseInt(offsetXY.y)) / parseInt(resizeXY.y),
  )

  return xOffset + numCols * yOffset
}

// ======  BIRD IDENTIFICATION  ======

const calcBirdIndex = (div) => {
  return calcCardIndex(div, 16, 11)
}

const getBoardBirdIndex = (player, loc) => {
  // Store at the per-card, per-turn JSON scope
  divId = `bird_img_${player}_${loc}`
  div = window.document.querySelectorAll(`div[id="${divId}"]`)[0]

  if (div.classList.contains('wsp_hidden')) {
    return NO_BIRD_ID
  }

  return calcBirdIndex(div)
}

const getHandBirdsIndices = () => {
  // Store at the per-player, per-turn JSON scope
  return [
    ...window.document.querySelectorAll('div[id^="handcard_bird_panel"]'),
  ].map((div) => calcBirdIndex(div))
}

// ======  EGG CALCULATION  ======

const calcEggCount = (player, loc) => {
  // Store at the per-card, per-turn JSON scope
  return window.document.querySelectorAll(
    `div[id="location_zone_${player}_${loc}"]`,
  )[0].children.length
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
