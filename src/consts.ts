import { E_Habitat, E_PlayedCardPosition, E_RoundBonusBoards } from './enums'

export const NO_BIRD_ID: number = -1

export const CARD_LOCATIONS: {
  [key in E_Habitat]: { [key in E_PlayedCardPosition]: string }
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
