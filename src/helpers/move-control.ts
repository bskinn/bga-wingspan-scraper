import { TMoveId } from '@type/types-ids'

export const advanceToMove = (move_num: TMoveId) => {
  const moveElement = window.document.querySelector(
    `div[id="replaylogs_move_${move_num}"]`,
  ) as HTMLDivElement

  if (moveElement != null) {
    moveElement.click()
  } else {
    const errMsg = `Replay log div for move '${move_num} not found in page`
    alert(errMsg)
    throw errMsg
  }
}

export const advanceToGameEnd = () => {
  var aElement1 = window.document.querySelector(
    'a[id="archive_end_game"]',
  ) as HTMLAnchorElement

  if (aElement1 != null) {
    aElement1.click()
  } else {
    const errMsg = `Anchor element to expose extra replay options not found`
    alert(errMsg)
    throw errMsg
  }

  var aElement2 = window.document.querySelector(
    'a[id="go_to_game_end_slow"]',
  ) as HTMLAnchorElement

  if (aElement2 != null) {
    aElement2.click()
  } else {
    const errMsg = `Anchor element to trigger replay advance to game end not found`
    alert(errMsg)
    throw errMsg
  }
}
