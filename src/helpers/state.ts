import { TRawTurnId, TTurnId } from '@type/types-ids'
import { TRoundTurnInfo } from '@type/types-score-scrape'

import { BONUS_TURN_ID } from '@/consts'

export const calcRoundTurn = (raw_turn: TRawTurnId): TRoundTurnInfo => {
  // raw_turn is zero-indexed
  // The output round and in-round turn are one-indexed
  if (raw_turn <= 7) {
    return { round: '1', turn: `${raw_turn + 1}` as TTurnId }
  } else if (raw_turn <= 14) {
    return { round: '2', turn: `${raw_turn - 7}` as TTurnId }
  } else if (raw_turn <= 20) {
    return { round: '3', turn: `${raw_turn - 14}` as TTurnId }
  } else if (raw_turn <= 25) {
    return { round: '4', turn: `${raw_turn - 20}` as TTurnId }
  } else if (raw_turn == 26) {
    return { round: '4', turn: BONUS_TURN_ID }
  } else {
    const errMsg = `Raw turn index out of bounds: ${raw_turn}`
    alert(errMsg)
    throw errMsg
  }
}
