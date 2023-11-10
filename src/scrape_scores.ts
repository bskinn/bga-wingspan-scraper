import { TMoveId, TRawTurnId, TRoundId, TTurnId } from './types_misc'
import {
  TCompleteScoreScrapeData,
  TFirstTurnList,
  TFirstTurnListPartial,
  TMoveInfo,
  TRawMoveInfo,
  TRoundBonusMoveInfo,
  TRoundTurnInfo,
  TScoreScrapeData,
  TScoreScrapeSingleScore,
} from './types_score_scrape'

import {
  BONUS_TURN_ID,
  BONUS_CARD_TURN_ID,
  GAME_END_TURN_ID,
  DEFAULT_MOVE_WAIT_POLL,
  NO_MOVE_NUM,
  ROUND_BONUS_MOVE_NAME,
} from './consts'

import { createArrayCycleProxy } from './proxies'

import { getColors, getNames, getScores, numPlayers } from './data_player'
import { getTableNum } from './data_table'

import { rangeArray } from './helpers_array'
import {
  sleepHelper,
  waitForGameEndHelper,
  waitForMoveHelper,
} from './helpers_async'
import { timestampFullShort } from './helpers_string'

import { logMsg } from './logging'

// ======  DEV HELPERS  ======

export const devRoundStartScores: Array<TScoreScrapeData> = [
  {
    move: '67',
    round: '2',
    turn: '1',
    scores: [
      {
        name: 'Brian Skinn',
        score: 5,
      },
      {
        name: 'xïkmd',
        score: 19,
      },
      {
        name: 'KrissiMay',
        score: 12,
      },
    ],
  },
  {
    move: '120',
    round: '3',
    turn: '1',
    scores: [
      {
        name: 'Brian Skinn',
        score: 17,
      },
      {
        name: 'xïkmd',
        score: 32,
      },
      {
        name: 'KrissiMay',
        score: 25,
      },
    ],
  },
  {
    move: '185',
    round: '4',
    turn: '1',
    scores: [
      {
        name: 'Brian Skinn',
        score: 48,
      },
      {
        name: 'xïkmd',
        score: 42,
      },
      {
        name: 'KrissiMay',
        score: 32,
      },
    ],
  },
  {
    move: '232',
    round: '4',
    turn: 'B',
    scores: [
      { name: 'Brian Skinn', score: 68 },
      { name: 'xïkmd', score: 65 },
      { name: 'KrissiMay', score: 52 },
    ],
  },
]

// ======  UTILITY FUNCTIONS  ======

const extractRoundBonusScore = (name: string, text: string) => {
  const match = text.match(
    new RegExp(`Action cubes.+?${name}.+?scor[^\\s]+\\s+(\\d+)\\s+point`),
  )

  if (match != null) {
    return parseInt(match[1])
  } else {
    const errMsg = `Player name "${name} not found in search text:\n\n${text}`
    alert(errMsg)
    throw errMsg
  }
}

const extractBonusCardScore = (name: string, text: string) => {
  // Find all the instances of bonus card scores and sum them
  return [
    ...text.matchAll(
      new RegExp(
        `[A-Z][A-Za-z ]+?:\\s+${name}\\s+has \\d+ birds, scoring (\\d+)`,
        'g',
      ),
    ),
  ].reduce((accum, newMatch) => accum + parseInt(newMatch[1]), 0)
}

const calcRoundTurn = (raw_turn: TRawTurnId): TRoundTurnInfo => {
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

// ======  MOVE STATE CONTROL  ======

const advanceToMove = (move_num: string) => {
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

const advanceToGameEnd = () => {
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

// ======  DATA EXPORT  ======

// From https://stackoverflow.com/a/18197341/4376000
function download(filename: string, text: string) {
  var element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
  )
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

// ======  ASYNC HELPERS  ======

// ======  BASIC DATA RETRIEVAL FUNCTIONS  ======

// ======  MOVE RETRIEVAL AND PROCESSING  ======

const getRawMoveInfo = (): Array<TRawMoveInfo> => {
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

// @ts-expect-error
const getNamedMoves = (rawMoveInfo: Array<TRawMoveInfo>): Array<TMoveInfo> => {
  // BELIEVED OBSOLETE
  // Returns object
  // move: Move number
  // name: Player name
  // msg: Log message
  // text: Full text match

  var names = getNames()

  return rawMoveInfo.map((rmi) => {
    const matchingNames: Array<string> = names.filter((n) =>
      rmi.moveText.startsWith(n),
    )

    if (matchingNames.length < 1) {
      const errMsg = `(getNamedMoves) No matching player name found in move ${rmi.moveNum} text:\n\n${rmi.fullText}`
      alert(errMsg)
      throw errMsg
    }

    if (matchingNames.length > 1) {
      const errMsg = `(getNamedMoves) Too many player names found in move ${rmi.moveNum} text:\n\n${rmi.fullText}`
      alert(errMsg)
      throw errMsg
    }

    return {
      moveNum: rmi.moveNum,
      playerName: matchingNames[0],
      moveText: rmi.moveText,
      fullText: rmi.fullText,
    }
  })
}

// @ts-expect-error
const removeUndoMoves = (namedMoves: Array<TMoveInfo>): Array<TMoveInfo> => {
  // BELIEVED OBSOLETE
  // Strip out any moves that are pure undo notification moves
  return namedMoves.filter((nm) => {
    !nm.moveText.startsWith(`${nm.playerName} may undo up to this point`)
  })
}

// @ts-expect-error
const removeRepeatMoves = (namedMoves: Array<TMoveInfo>): Array<TMoveInfo> => {
  // BELIEVED OBSOLETE
  // Pass the moves list through after undos are stripped out
  // Skip the first move entirely, it will be the discard move.
  // Keep the second move, it will be the first move of the game.

  return namedMoves.filter((nm, idx, arr) => {
    if (idx == 0) {
      return false
    }
    if (idx == 1) {
      return true
    }

    return nm.playerName != arr[idx - 1].playerName
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

const getMovesList = (): Array<TMoveInfo> => {
  // This is the fully prepared moves list that most functions
  // should work with
  // return removeRepeatMoves(removeUndoMoves(getNamedMoves(getMoveInfo())))
  return getActionCubeMoves(getRawMoveInfo())
}

const getMoveIds = (movesList: Array<TMoveInfo>): Array<TMoveId> => {
  var moveIds = movesList.map((m) => m.moveNum as TMoveId)
  return moveIds.sort((a, b) => {
    return Math.sign(parseInt(a) - parseInt(b))
  })
}

const getTurnsetStartMoveIds = (moveIds: Array<TMoveId>): Array<TMoveId> => {
  return rangeArray(26).map((i) => {
    return moveIds[i * numPlayers()]
  })
}

const getPlayOrderProxy = (movesList: Array<TMoveInfo>): Array<string> => {
  // We draw from the movesList instead of just cycle-proxying over the
  // Array from getNames() because the former will accurately capture
  // the player who has first turn in the first round.
  return createArrayCycleProxy(
    movesList.slice(0, getNames().length).map((m) => m.playerName),
  )
}

// ======  ROUND BONUS HANDLING  ======

const getRoundBonusMoves = (): Array<TRoundBonusMoveInfo> => {
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

const calcAndAddRoundEndScores = (
  scoreData: Array<TScoreScrapeData>,
  round: TRoundId,
) => {
  // Subtracting the round bonus scores from the scores at the
  // start of the next round, to get the scores prior to the
  // round bonuses, for rounds 1-3.
  // Round 4 needs special treatment because of the end of
  // game behavior; handled as part of calcAndAddGameEndScores().

  const names = getNames()

  // Scores at the start of the next round
  const nextScores = scoreData.find(
    (sd) => sd.round == `${round + 1}` && sd.turn == '1',
  )

  if (nextScores == null) {
    const errMsg = `Failed to find score data for round ${
      parseInt(round) + 1
    } while calculating round-end scores for round ${round}`
    alert(errMsg)
    throw errMsg
  }

  // Text of the relevant round bonus move. We subtract one since the
  // JS array object is zero-indexed.
  const bonusMove = getRoundBonusMoves()[parseInt(round) - 1]

  // Initialize the score entry object
  const newEntry = {
    move: bonusMove.moveNum,
    round: round,
    turn: BONUS_TURN_ID,
    scores: [] as Array<TScoreScrapeSingleScore>,
  }

  names.forEach((name) => {
    const nextScoreData = nextScores.scores.find((ns) => ns.name == name)

    if (nextScoreData == null) {
      const errMsg = `Failed to find score data for player '${name}' while calculating round-end scores for round ${round}`
      alert(errMsg)
      throw errMsg
    }

    const nextScore = nextScoreData.score
    const roundBonusScore = extractRoundBonusScore(name, bonusMove.fullText)

    // Calculate the math but keep the result as a string since that's
    // how everything is (for now)
    let roundEndScore = nextScore - roundBonusScore

    // Push the calculated score into the score entry object
    newEntry.scores.push({ name: name, score: roundEndScore })
  })

  // Push the new score entry object into the overall data
  scoreData.push(newEntry)
}

const calcAndAddGameEndScores = (scoreData: Array<TScoreScrapeData>) => {
  // Parse the final round-end move text for both the
  // R4 round bonuses and the bonus card bonuses
  //

  // Get the end of game move text and the names list
  const finalMoveText = getRoundBonusMoves()[3].fullText
  const names = getNames()
  const referenceScores = scoreData.find(
    (sd) => sd.round == '4' && sd.turn == BONUS_TURN_ID,
  )

  if (referenceScores == null) {
    const errMsg = `Failed to find round 4 bonus turn score info while attempting to add game-end scores`
    alert(errMsg)
    throw errMsg
  }

  logMsg(JSON.stringify(referenceScores))

  // Initialize score objects for after round bonuses and for
  // end of game score
  const roundBonusScores: TScoreScrapeData = {
    move: NO_MOVE_NUM,
    round: '4' as TRoundId,
    turn: BONUS_CARD_TURN_ID,
    scores: [] as Array<TScoreScrapeSingleScore>,
  }
  const endGameScores = {
    move: NO_MOVE_NUM,
    round: '4' as TRoundId,
    turn: GAME_END_TURN_ID,
    scores: [] as Array<TScoreScrapeSingleScore>,
  }

  names.forEach((name) => {
    // Get the relevant scores
    var roundScore = extractRoundBonusScore(name, finalMoveText)
    var cardScore = extractBonusCardScore(name, finalMoveText)
    var refScoreData = referenceScores.scores.find((rs) => rs.name == name)

    if (refScoreData == null) {
      const errMsg = `Expected player '${name}' not found in reference score data`
      alert(errMsg)
      throw errMsg
    }

    var refScore = refScoreData.score

    // Add the score entries for the current player name
    roundBonusScores.scores.push({
      name: name,
      score: refScore + roundScore,
    })
    endGameScores.scores.push({
      name: name,
      score: refScore + roundScore + cardScore,
    })
  })

  // Add the new score entries to the score data
  scoreData.push(roundBonusScores)
  scoreData.push(endGameScores)
}

const calcAndAddAllEndScores = (scoreData: Array<TScoreScrapeData>) => {
  // scoreData should be the output from getTurnsetScores(),
  // or a simulation of it
  for (const round of rangeArray(3, 1)) {
    calcAndAddRoundEndScores(scoreData, `${round}` as TRoundId)
  }

  calcAndAddGameEndScores(scoreData)
}

// ======  FIXING ANY LAST-TURN GLITCHES  ======

const correctLastTurnGlitches = (scoreData: Array<TScoreScrapeData>) => {
  // Assumes we've been advanced to the endgame state
  // Collect the scores
  const endGameActualData = scrapeResults()

  // Pluck the end-game scores from the passed score data
  const endGameScoreData = scoreData.find(
    (sd) => sd.round == '4' && sd.turn == GAME_END_TURN_ID,
  )

  if (endGameScoreData == null) {
    const errMsg = `Game end score data not found when trying to correct last turn glitches`
    alert(errMsg)
    throw errMsg
  }

  const endGameCalcData = endGameScoreData.scores

  // Loop over the player names, calculate the difference between
  // the actual and calculated end-game scores for each player,
  // and add that difference to all of the pre-round bonus, pre-bonus card,
  // and end-game scores. This can happen if a final bit of points from the
  // last turn is included in the round-bonus move in the replay log
  // (e.g., when a bird that lays eggs in everyone's habitat is used
  // on that last turn of the game; see game 416620972)
  getNames().forEach((name) => {
    var actual = endGameActualData.find((d) => d.name == name)
    var calc = endGameCalcData.find((d) => d.name == name)

    if (actual == null) {
      const errMsg = `Score for player '${name}' not found in end-game 'actual' data`
      alert(errMsg)
      throw errMsg
    }

    if (calc == null) {
      const errMsg = `Score for player '${name}' not found in end-game 'actual' data`
      alert(errMsg)
      throw errMsg
    }

    var diff = actual.score - calc.score

    logMsg(`Endgame glitch calc for ${name}: ${diff}`)

    for (let turn_id of [BONUS_TURN_ID, BONUS_CARD_TURN_ID, GAME_END_TURN_ID]) {
      const workingScoreData = scoreData.find(
        (sd) => sd.round == '4' && sd.turn == turn_id,
      )

      if (workingScoreData == null) {
        const errMsg = `Failed to find score data for turn ID '${turn_id} while correcting possible end-game glitches`
        alert(errMsg)
        throw errMsg
      }

      const workingScores = workingScoreData.scores

      const working = workingScores.find((s) => s.name == name)

      if (working == null) {
        const errMsg = `Score for player '${name}' not found in data for turn ID '${turn_id} while correcting possible end-game glitches`
        alert(errMsg)
        throw errMsg
      }

      // Scores are Numbers now
      working.score += diff
    }
  })
}

// ======  FINDING FIRST-TURNS  ======

const getFirstTurns = (): TFirstTurnList => {
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

// ======  FINDING THE WINNER  ======

const getWinner = (): string => {
  const endDivs = [...window.document.querySelectorAll('div')].filter(
    (div) => div.textContent?.includes('The end of the game'),
  ) as Array<HTMLDivElement>

  if (endDivs.length < 1) {
    const errMsg = `No suitable divs found for retrieving winner name`
    alert(errMsg)
    throw errMsg
  }

  const endDiv = endDivs[0]

  if (endDiv.textContent == null) {
    const errMsg = `This should have been impossible, but no text was found in the winner-reporting div, despite it passing the initial filtering`
    alert(errMsg)
    throw errMsg
  }

  const endDivMatch = endDiv.textContent.match(
    /The end of the game: (.+?) wins!/,
  )

  if (endDivMatch == null) {
    const errMsg = `Winner name could not be extracted from the end-game div`
    alert(errMsg)
    throw errMsg
  }

  return endDivMatch[1]
}

// ======  STATE VALIDATION ======

const checkMoveListLength = (): boolean => {
  return getMovesList().length == numPlayers() * 26
}

const checkFullPlaySequence = (): boolean => {
  // Check to see whether the sequence of moves identified by
  // getMovesList() contains the players in the sequence as
  // expected by the actual game progression (advancement of
  // first player each round, etc.)

  const actualMoves = getMovesList()
  const actualPlayerSequence = actualMoves.map((m) => m.playerName)
  const orderProxy = getPlayOrderProxy(actualMoves)

  // This assembles the expected move sequence based on the core player
  // order determined by getPlayOrderProxy()
  // We start by assembling the list for each round...
  const expectedPlayerSequencesPerRound = rangeArray(4, 1).map((round_num) => {
    return rangeArray((9 - round_num) * numPlayers()).map(
      (i) => orderProxy[i + round_num - 1],
    )
  })

  // ... and then we concatenate everything together.
  const expectedPlayerSequence = expectedPlayerSequencesPerRound.reduce(
    (accum, arr) => accum.concat(arr),
  )

  // Now we check whether expected matches actual
  return expectedPlayerSequence.every((n, i) => {
    return n == actualPlayerSequence[i]
  })
}

// ======  PROCESSING SCORES  ======

const scrapeResults = (): Array<TScoreScrapeSingleScore> => {
  const results = { scores: getScores(), names: getNames() }
  return results.names.map((n, i) => {
    return { name: n, score: results.scores[i] }
  })
}

async function getScoreForMove(
  move_num: TMoveId,
  timeout_step = DEFAULT_MOVE_WAIT_POLL,
) {
  // Replay wait-to-complete is in seconds

  // Trigger the replay advance
  logMsg(`Advancing replay to move ${move_num}.`)
  advanceToMove(move_num)

  logMsg('Waiting for replay to advance...')
  await waitForMoveHelper(move_num, timeout_step)
  logMsg('Replay advance done.')

  return scrapeResults()
}

async function getTurnsetScores(timeout_step = DEFAULT_MOVE_WAIT_POLL) {
  var moves = getTurnsetStartMoveIds(getMoveIds(getMovesList()))
  const data: Array<TScoreScrapeData> = []

  // These are the first turnsets of rounds 2-4, plus the last turnset,
  // falling right before the last round bonus and bonus card calculation
  const slowTurnsets = [9, 16, 22, 27]

  // Add in the very final move that can be advanced to with
  // move clicks
  moves.push(getRoundBonusMoves()[3].moveNum)

  // Step through each turnset and pull the scores
  for (const [idx, mi] of moves.entries()) {
    const turnset_num = (idx + 1) as TRawTurnId
    logMsg(
      `Start score retrieval for turnset ${turnset_num}, at log move ${mi}...`,
    )

    const timeout_current =
      timeout_step * (slowTurnsets.includes(turnset_num) ? 3 : 1)

    logMsg(`Wait timeout is ${timeout_current} sec.`)
    const result = await getScoreForMove(mi, timeout_current)
    data.push({
      move: mi,
      ...calcRoundTurn(idx as TRawTurnId),
      scores: result,
    })
    logMsg(`Score retrieval complete for turnset ${turnset_num}.`)
  }

  return data
}

// ======  EXTENSION  ======

// Button for testing await behavior
const buttonAwaitTest = document.createElement('button')
buttonAwaitTest.textContent = 'Test Await'
buttonAwaitTest.id = 'buttonAwaitTest'
buttonAwaitTest.style.position = 'fixed'
buttonAwaitTest.style.top = '85%'
buttonAwaitTest.style.left = '10px'
buttonAwaitTest.style.height = '2em'
buttonAwaitTest.style.width = '8em'
buttonAwaitTest.addEventListener('click', async () => {
  console.log('Start')
  await sleepHelper(5000)
  console.log('End')
})
document.body.appendChild(buttonAwaitTest)

// Button for checking the turnset move list length
const buttonCheckMoveList = document.createElement('button')
buttonCheckMoveList.textContent = 'Check Move List'
buttonCheckMoveList.id = 'buttonCheckMoveList'
buttonCheckMoveList.style.position = 'fixed'
buttonCheckMoveList.style.top = '90%'
buttonCheckMoveList.style.left = '10px'
buttonCheckMoveList.style.height = '2em'
buttonCheckMoveList.style.width = '10em'
buttonCheckMoveList.addEventListener('click', () => {
  alert(checkMoveListLength() ? 'Check OK' : 'Check FAILED')
})
document.body.appendChild(buttonCheckMoveList)

// Button for checking the player sequence in the turnset move list
const buttonCheckPlaySeq = document.createElement('button')
buttonCheckPlaySeq.textContent = 'Check Play Sequence'
buttonCheckPlaySeq.id = 'buttonCheckPlaySeq'
buttonCheckPlaySeq.style.position = 'fixed'
buttonCheckPlaySeq.style.top = '90%'
buttonCheckPlaySeq.style.left = '11em'
buttonCheckPlaySeq.style.height = '2em'
buttonCheckPlaySeq.style.width = '12em'
buttonCheckPlaySeq.addEventListener('click', () => {
  alert(checkFullPlaySequence() ? 'Check OK' : 'Check FAILED')
})
document.body.appendChild(buttonCheckPlaySeq)

// Button to start score scraping
const buttonScrapeScores = document.createElement('button')
buttonScrapeScores.textContent = 'Scrape Scores'
buttonScrapeScores.id = 'buttonScrapeScores'
buttonScrapeScores.style.position = 'fixed'
buttonScrapeScores.style.top = '95%'
buttonScrapeScores.style.left = '20px'
buttonScrapeScores.style.height = '2em'
buttonScrapeScores.style.width = '10em'
buttonScrapeScores.addEventListener('click', async () => {
  buttonScrapeScores.disabled = true
  await scrapeAndSave()
})
document.body.appendChild(buttonScrapeScores)

// Input field for debug expression to evaluate
const inputDebugEval = document.createElement('input')
inputDebugEval.id = 'inputDebugEval'
inputDebugEval.type = 'text'
inputDebugEval.style.position = 'fixed'
inputDebugEval.style.top = '95%'
inputDebugEval.style.left = '21em'
inputDebugEval.style.height = '2em'
inputDebugEval.style.width = '20em'
inputDebugEval.style.paddingLeft = '0.25em'
inputDebugEval.style.paddingRight = '0.25em'
document.body.appendChild(inputDebugEval)

// Button to trigger debug evaluate and print
const buttonDebugPrint = document.createElement('button')
buttonDebugPrint.textContent = 'Debug Print'
buttonDebugPrint.id = 'buttonDebugPrint'
buttonDebugPrint.style.position = 'fixed'
buttonDebugPrint.style.top = '95%'
buttonDebugPrint.style.left = '13em'
buttonDebugPrint.style.height = '2em'
buttonDebugPrint.style.width = '8em'
buttonDebugPrint.addEventListener('click', () => {
  try {
    const result = eval(inputDebugEval.value)
    alert(JSON.stringify(result))
  } catch (err) {
    alert(`Error: ${(err as Error).message}`)
  }
})
document.body.appendChild(buttonDebugPrint)

// Extra listener for the Enter keyup in the input field,
// so we don't have to use the mouse to do the debug print
inputDebugEval.addEventListener('keyup', function (event) {
  if (event.key == 'Enter') {
    buttonDebugPrint.click()
  }
})

// ======  PUBLIC API  ======

export const reportCurrentScores = (): void => {
  const names = getNames()
  const scores = getScores()

  console.log(`${names.join()}\n${scores.join()}`)
}

async function scrapeAndSave() {
  // Get the main data and augment with end-scores
  const data = await getTurnsetScores()
  calcAndAddAllEndScores(data)

  // Advance to the endgame state, with detection wait
  advanceToGameEnd()
  await waitForGameEndHelper()

  // Fix the endgame scores
  correctLastTurnGlitches(data)

  const outerData: TCompleteScoreScrapeData = {
    data: data,
    table: getTableNum(),
    timestamp: timestampFullShort(),
    colors: getNames().map((n, i) => {
      return { name: n, color: getColors()[i] }
    }),
    first_turns: getFirstTurns(),
    winner: getWinner(),
  }

  download(
    `${getTableNum()}-${timestampFullShort()}.json`,
    JSON.stringify(outerData),
  )
  download(
    `${getTableNum()}-${timestampFullShort()}.b64`,
    btoa(JSON.stringify(outerData)),
  )
}
