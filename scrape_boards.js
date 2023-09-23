// ======  USEFUL CONSTANTS  ======
CARD_LOCATIONS = [
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
NO_BIRD_ID = -1

// ======  HELPER FUNCTIONS  ======
cardLocationDescription = (locId) => {
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

getXYPixelValues = (xyString) => {
  mch = xyString.match(/(-?\d+)px\s+(-?\d+)px/)
  return { x: mch[1], y: mch[2] }
}

// ======  BASIC DATA RETRIEVAL FUNCTIONS  ======

getIds = () => {
  return $$('div[class="player-name"]').map((div) => div.id.split('_')[2])
}

getNames = () => {
  return getIds().map((id) =>
    $$(`div[id$="${id}"][class="player-name"]`)[0].textContent.trim(),
  )
}

// ======  BIRD IDENTIFICATION  ======

calcBirdIndex = (div) => {
  resizeData = getComputedStyle(div)['background-size']
  offsetData = getComputedStyle(div)['background-position']

  resizeXY = getXYPixelValues(resizeData)
  offsetXY = getXYPixelValues(offsetData)

  xOffset = Math.round((-16 * parseInt(offsetXY.x)) / parseInt(resizeXY.x))
  yOffset = Math.round((-11 * parseInt(offsetXY.y)) / parseInt(resizeXY.y))

  return xOffset + 16 * yOffset
}

getBirdIndex = (player, loc) => {
  divId = `bird_img_${player}_${loc}`
  div = $$(`div[id="${divId}"]`)[0]

  if (div.classList.contains('wsp_hidden')) {
    return NO_BIRD_ID
  }

  return calcBirdIndex(div)
}

// ======  EGG CALCULATION  ======

calcEggCount = (player, loc) => {
  return $$(`div[id="location_zone_${player}_${loc}"]`)[0].children.length
}

// ======  TUCKED CARD CALCULATION  ======

calcTuckCount = (player, loc) => {
  div = $$(`div[id="tuckedcounter_${player}_${loc}"]`)[0]

  return div ? parseInt(div.textContent) : 0
}

// ======  CACHED FOOD CALCULATION  ======

calcCacheCount = (player, loc) => {
  accum = 0
  divs = $$(`div[id^="cachecounter_${player}_${loc}_"]`)

  divs.forEach((div) => {
    accum += parseInt(div.textContent)
  })

  return accum
}

// ======  PUBLIC API  ======

printNameInfo = () => {
  getNames().forEach((n, i) => {
    console.log(`${n}: ${getIds()[i]}`)
  })
}
