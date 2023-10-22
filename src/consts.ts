import { E_Habitat, E_PlayedCardPosition, E_RoundBonusBoards } from './enums'
import { TBoardLocationIDs, TBoardLocationDescriptions } from './types'

export const NO_BIRD_ID: number = -1

export const BOARD_LOCATION_IDS: {
  [key1 in E_Habitat]: { [key2 in E_PlayedCardPosition]: TBoardLocationIDs }
} = {
  [E_Habitat.Forest]: {
    [E_PlayedCardPosition.First]: '9',
    [E_PlayedCardPosition.Second]: '10',
    [E_PlayedCardPosition.Third]: '11',
    [E_PlayedCardPosition.Fourth]: '12',
    [E_PlayedCardPosition.Fifth]: '13',
  },
  [E_Habitat.Grassland]: {
    [E_PlayedCardPosition.First]: '17',
    [E_PlayedCardPosition.Second]: '18',
    [E_PlayedCardPosition.Third]: '19',
    [E_PlayedCardPosition.Fourth]: '20',
    [E_PlayedCardPosition.Fifth]: '21',
  },
  [E_Habitat.Wetland]: {
    [E_PlayedCardPosition.First]: '25',
    [E_PlayedCardPosition.Second]: '26',
    [E_PlayedCardPosition.Third]: '27',
    [E_PlayedCardPosition.Fourth]: '28',
    [E_PlayedCardPosition.Fifth]: '29',
  },
}

export const BOARD_LOCATION_DESCRIPTIONS: {
  [key1 in E_Habitat]: {
    [key2 in E_PlayedCardPosition]: TBoardLocationDescriptions
  }
} = {
  [E_Habitat.Forest]: {
    [E_PlayedCardPosition.First]: 'Forest 1',
    [E_PlayedCardPosition.Second]: 'Forest 2',
    [E_PlayedCardPosition.Third]: 'Forest 3',
    [E_PlayedCardPosition.Fourth]: 'Forest 4',
    [E_PlayedCardPosition.Fifth]: 'Forest 5',
  },
  [E_Habitat.Grassland]: {
    [E_PlayedCardPosition.First]: 'Grassland 1',
    [E_PlayedCardPosition.Second]: 'Grassland 2',
    [E_PlayedCardPosition.Third]: 'Grassland 3',
    [E_PlayedCardPosition.Fourth]: 'Grassland 4',
    [E_PlayedCardPosition.Fifth]: 'Grassland 5',
  },
  [E_Habitat.Wetland]: {
    [E_PlayedCardPosition.First]: 'Wetland 1',
    [E_PlayedCardPosition.Second]: 'Wetland 2',
    [E_PlayedCardPosition.Third]: 'Wetland 3',
    [E_PlayedCardPosition.Fourth]: 'Wetland 4',
    [E_PlayedCardPosition.Fifth]: 'Wetland 5',
  },
}

export const ROUND_BONUS_SCORES: {
  [key in E_RoundBonusBoards]: Array<Array<number>>
} = {
  [E_RoundBonusBoards.Green]: [
    [4, 1, 0, 0],
    [5, 2, 1, 0],
    [6, 3, 2, 0],
    [7, 4, 3, 0],
  ],
  [E_RoundBonusBoards.Blue]: [[5, 4, 3, 2, 1, 0]],
}
