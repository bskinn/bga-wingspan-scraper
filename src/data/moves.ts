import { TMoveId, TRoundId } from '../types/types-ids'
import {
  TFirstTurnList,
  TFirstTurnListPartial,
  TMoveInfo,
  TRawMoveInfo,
  TRoundBonusMoveInfo,
} from '../types/types-score-scrape'
import { getNames, numPlayers } from './table'
import { createArrayCycleProxy, rangeArray } from '../helpers/array'
import { ROUND_BONUS_MOVE_NAME } from '@/consts'

export const getRawMoveInfo = (): Array<TRawMoveInfo> => {
  // Array of info for all the moves in the replay.
  //
  // Formerly, for each element of the outer Array (each move):
  //   First element is the entire match.
  //   Second is the move number.
  //   Third, if present, is the date.
  //   Fourth is the full text of the move message.
  //
  // But now we're using the TMoveInfo type.
  //
  const divs = [
    ...window.document.querySelectorAll('div[id^="replaylogs_move_"]'),
  ] as Array<HTMLDivElement>

  return divs.map((div: HTMLDivElement) => {
    const text = div.textContent

    if (text) {
      const mch = text.match(
        /Move (\d+)\s+:([0-9]+\/[0-9]+\/[0-9]+\s*)?[0-9:]+\s*[AP]M(.+)/,
      )

      if (mch) {
        const mchArr = [...mch]

        if (mchArr.length == 4) {
          return {
            fullText: mchArr[0],
            moveNum: mchArr[1] as TMoveId,
            dateStr: mchArr[2],
            moveText: mchArr[3],
          }
        } else {
          const errMsg = `Incorrect number of match groups for div text:\n\n${text}`
          alert(errMsg)
          throw errMsg
        }
      } else {
        const errMsg = `Regex for replay log parsing failed for div text:\n\n${text}`
        alert(errMsg)
        throw errMsg
      }
    } else {
      const errMsg = `Empty div contents found for div:\n\n${div}`
      alert(errMsg)
      throw errMsg
    }
  })
}

const getActionCubeMoves = (
  movesList: Array<TRawMoveInfo>,
): Array<TMoveInfo> => {
  // Trying a different tack on the moves list
  // Returns object
  // move: Move number
  // name: Player name
  // msg: Log message
  // text: Full text match
  var names = getNames()

  const filteredRawMoves = movesList.filter((m) =>
    m.moveText.match(/places an action cube/),
  )

  return filteredRawMoves.map((frm) => {
    const matchingNames = names.filter((n) => {
      return frm.moveText.match(new RegExp(`^.*?${n}\\s+places an action cube`))
    })

    if (matchingNames.length < 1) {
      const errMsg = `(getActionCubeMoves) No matching player name found in move ${frm.moveNum} text:\n\n${frm.fullText}`
      alert(errMsg)
      throw errMsg
    }

    if (matchingNames.length > 1) {
      const errMsg = `(getActionCubeMoves) Too many player names found in move ${frm.moveNum} text:\n\n${frm.fullText}`
      alert(errMsg)
      throw errMsg
    }

    return {
      moveNum: frm.moveNum,
      playerName: matchingNames[0],
      moveText: frm.moveText,
      fullText: frm.fullText,
    }
  })
}

export const getMovesList = (): Array<TMoveInfo> => {
  // This is the fully prepared moves list that most functions
  // should work with
  // return removeRepeatMoves(removeUndoMoves(getNamedMoves(getMoveInfo())))
  return getActionCubeMoves(getRawMoveInfo())
}

export const getMoveIds = (movesList: Array<TMoveInfo>): Array<TMoveId> => {
  var moveIds = movesList.map((m) => m.moveNum as TMoveId)
  return moveIds.sort((a, b) => {
    return Math.sign(parseInt(a) - parseInt(b))
  })
}

export const getTurnsetStartMoveIds = (
  moveIds: Array<TMoveId>,
): Array<TMoveId> => {
  return rangeArray(26).map((i) => {
    return moveIds[i * numPlayers()]
  })
}

export const getPlayOrderProxy = (
  movesList: Array<TMoveInfo>,
): Array<string> => {
  // We draw from the movesList instead of just cycle-proxying over the
  // Array from getNames() because the former will accurately capture
  // the player who has first turn in the first round.
  return createArrayCycleProxy(
    movesList.slice(0, getNames().length).map((m) => m.playerName),
  )
}

// ======  ROUND BONUS HANDLING  ======

export const getRoundBonusMoves = (): Array<TRoundBonusMoveInfo> => {
  // Get info specifically on the round bonus moves
  const filteredRawMoves = getRawMoveInfo().filter((rmi) => {
    return rmi != null && rmi.moveText.includes('Action cubes are returned')
  })

  return filteredRawMoves.map((frm) => {
    return {
      moveNum: frm.moveNum,
      name: ROUND_BONUS_MOVE_NAME,
      fullText: frm.fullText,
    }
  })
}

// ======  FINDING FIRST-TURNS  ======

export const getFirstTurns = (): TFirstTurnList => {
  const firstMove = getMovesList()[0]
  const firstMovePlayerNameMatch = firstMove.moveText.match(/^(.+?) places/)

  if (firstMovePlayerNameMatch == null) {
    const errMsg = `Player name not found in replay log message for first turn`
    alert(errMsg)
    throw errMsg
  }

  const firstMovePlayerName = firstMovePlayerNameMatch[1]

  const firstTurns: TFirstTurnListPartial = { 1: firstMovePlayerName }

  rangeArray(3, 2).forEach((round) => {
    let workingDiv = [...window.document.querySelectorAll('div')]
      .filter((div) => {
        if (div.textContent == null) {
          const errMsg = `Empty div found while looking for round ${round} first player`
          alert(errMsg)
          throw errMsg
        }
        return div.textContent.includes('is now first player')
      })
      .filter((div) => {
        if (div.textContent == null) {
          const errMsg = `Empty div found while looking for round ${round} first player`
          alert(errMsg)
          throw errMsg
        }
        return div.textContent.includes(`Round ${round}`)
      })[0]

    if (workingDiv.textContent == null) {
      const errMsg = `Empty div found while looking for round ${round} first player`
      alert(errMsg)
      throw errMsg
    }

    const workingMatch = workingDiv.textContent.match(
      new RegExp(`Round ${round}: (.+?) is now first player`),
    )

    if (workingMatch == null) {
      const errMsg = `Search failed while parsing replay log for round ${round} first player name`
      alert(errMsg)
      throw errMsg
    }

    firstTurns[`${round}` as TRoundId] = workingMatch[1]
  })

  return firstTurns as TFirstTurnList
}
