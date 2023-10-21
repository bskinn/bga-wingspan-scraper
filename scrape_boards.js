// ======  USEFUL CONSTANTS  ======
const CARD_LOCATIONS = [
  '9',
  '10',
  '11',
  '12',
  '13',
  '17',
  '18',
  '19',
  '20',
  '21',
  '25',
  '26',
  '27',
  '28',
  '29',
]
const NO_BIRD_ID = -1

// ======  HELPER FUNCTIONS  ======
const cardLocationDescription = (locId) => {
  return {
    9: 'Forest 1',
    10: 'Forest 2',
    11: 'Forest 3',
    12: 'Forest 4',
    13: 'Forest 5',
    17: 'Grassland 1',
    18: 'Grassland 2',
    19: 'Grassland 3',
    20: 'Grassland 4',
    21: 'Grassland 5',
    25: 'Wetland 1',
    26: 'Wetland 2',
    27: 'Wetland 3',
    28: 'Wetland 4',
    29: 'Wetland 5',
  }[locId]
}

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
  divId = `bird_img_${player}_${loc}`
  div = window.document.querySelectorAll(`div[id="${divId}"]`)[0]

  if (div.classList.contains('wsp_hidden')) {
    return NO_BIRD_ID
  }

  return calcBirdIndex(div)
}

const getHandBirdsIndexes = () => {
  return [
    ...window.document.querySelectorAll('div[id^="handcard_bird_panel"]'),
  ].map((div) => calcBirdIndex(div))
}

// ======  EGG CALCULATION  ======

const calcEggCount = (player, loc) => {
  return window.document.querySelectorAll(
    `div[id="location_zone_${player}_${loc}"]`,
  )[0].children.length
}

// ======  TUCKED CARD CALCULATION  ======

const calcTuckCount = (player, loc) => {
  div = window.document.querySelectorAll(
    `div[id="tuckedcounter_${player}_${loc}"]`,
  )[0]

  return div ? parseInt(div.textContent) : 0
}

// ======  CACHED FOOD CALCULATION  ======

const calcCacheCount = (player, loc) => {
  accum = 0
  divs = window.document.querySelectorAll(
    `div[id^="cachecounter_${player}_${loc}_"]`,
  )

  divs.forEach((div) => {
    accum += parseInt(div.textContent)
  })

  return accum
}

// ======  PUBLIC API  ======

const printNameInfo = () => {
  getNames().forEach((n, i) => {
    console.log(`${n}: ${getIds()[i]}`)
  })
}
