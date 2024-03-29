import type { TMoveId } from '@/types/types-ids'

import { getRawMoveInfo } from '@/data/moves'
import { logMsg } from '@/helpers/logging'

export const sleepHelper = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const waitForGameEndHelper = (timeout_step = 10) => {
  logMsg('Waiting for game end...')

  function waiter(resolve: Function) {
    if (
      [...window.document.querySelectorAll('span')].some(
        (span) => span.textContent?.includes('End of game'),
      )
    ) {
      logMsg('Reached game end.')
      resolve()
    } else {
      logMsg('Waiting...')
      setTimeout(() => waiter(resolve), 1000 * timeout_step)
    }
  }

  return new Promise((resolve) => waiter(resolve))
}

export const waitForMoveHelper = (move_num: string, timeout_step = 1) => {
  // We're waiting for the previous move's class to be viewed.
  // We use a nonzero default on the timeout_step so that it doesn't spam
  // the system if accidentally called without a timeout while
  // developing/debugging.

  const actualMovesNumsList = getRawMoveInfo().map((rmi) => rmi.moveNum)
  const tgtMoveIndex = actualMovesNumsList.indexOf(move_num as TMoveId)
  const watched_move_num = actualMovesNumsList[tgtMoveIndex - 1]

  logMsg(`Watching move ${watched_move_num}.`)

  function finisher(resolve: Function) {
    resolve()
  }

  function waiter(resolve: Function) {
    const checkDivs = window.document.querySelectorAll(
      `div[id="replaylogs_move_${watched_move_num}"][class~="viewed"]`,
    )

    if (checkDivs.length < 1) {
      logMsg('Waiting...')
      setTimeout(() => waiter(resolve), 1000 * timeout_step)
    } else {
      logMsg(
        'Move reached, waiting one more time to ensure animation is complete...',
      )
      setTimeout(() => finisher(resolve), 1000 * timeout_step)
    }
  }

  return new Promise((resolve) => waiter(resolve))
}
