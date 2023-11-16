// Birds on boards, birds in hand
// Perhaps eventually birds in the tray
// Probably NOT birds in discard, since those will take
//  tracking/scraping out of the replay log, more than the board itself

import { TBirdId, TBoardLocationID } from '@type/types-ids'

import { NO_BIRD_ID } from '@/consts'
import { calcCardIndex } from '@/helpers/card-index'

const calcBirdId = (div: HTMLDivElement): TBirdId => {
  // Infer the bird card present (if any) in some location
  return calcCardIndex(div, 16, 11) as TBirdId
}

// @ts-expect-error
const getBoardBirdId = (playerId: string, loc: TBoardLocationID): TBirdId => {
  // Retrieve info on the single bird present (or not) at a specific
  // spot on a specific player's board
  // Store at the per-card, per-turn JSON scope
  const divId = `bird_img_${playerId}_${loc}`
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
  // Retrieve a list of all birds currently in the view-perspective
  // player's hand. Can be length zero.
  // Store at the per-player, per-turn JSON scope
  const divArray: Array<HTMLDivElement> = [
    ...window.document.querySelectorAll('div[id^="handcard_bird_panel"]'),
  ] as Array<HTMLDivElement>
  return divArray.map((div) => calcBirdId(div))
}
