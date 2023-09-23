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

// ======  BASIC DATA RETRIEVAL FUNCTIONS  ======

getIds = () => {
  return $$('div[class="player-name"]').map((div) => div.id.split('_')[2])
}

getNames = () => {
  return getIds().map((id) =>
    $$(`div[id$="${id}"][class="player-name"]`)[0].textContent.trim(),
  )
}
