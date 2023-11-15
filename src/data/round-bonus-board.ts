import type { TRoundBonusChipId } from '@/types/types-ids'
import { rangeArray } from '@/helpers/array'
import { calcCardIndex } from '@/helpers/card-index'

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
