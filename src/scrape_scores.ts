import { TMoveId, TRawTurnId, TRoundId } from './types_misc'
import {
  TFirstTurnList,
  TFirstTurnListPartial,
  TMoveInfo,
  TRawMoveInfo,
  TRoundBonusMoveInfo,
  TScoreScrapeData,
  TScoreScrapeSingleScore,
} from './types_score_scrape'

import {
  BONUS_TURN_ID,
  BONUS_CARD_TURN_ID,
  GAME_END_TURN_ID,
  DEFAULT_ENDGAME_WAIT,
  DEFAULT_MOVE_WAIT_POLL,
  NO_MOVE_NUM,
  ROUND_BONUS_MOVE_NAME,
} from './consts'

import { createArrayCycleProxy } from './proxies'

// ======  DEV HELPERS  ======

const devRoundStartScores: Array<TScoreScrapeData> = [
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

// ======  PROXY HANDLERS  ======

// ======  UTILITY FUNCTIONS  ======
const twoDigit = (val: number): string => {
  return val >= 10 ? `${val}` : `0${val}`
}

const logMsg = (msg: string): void => {
  const now = new Date()

  const tstamp = `${twoDigit(now.getHours())}:${twoDigit(
    now.getMinutes(),
  )}:${twoDigit(now.getSeconds())}`

  console.log(`SCORE SCRAPE [${tstamp}]: ${msg}`)
}

const rangeArray = (len: number, start = 0, step = 1): Array<number> => {
  return Array.from(Array(len).keys(), (k) => start + step * k)
}

const tableNum = (): string => {
  const search = window.location.search

  if (search !== null) {
    const match = search.match(/[?&]table=(\d+)(&|$)/)

    if (match != null) {
      return match[1]
    } else {
      const errMsg = `Table number not found in query parameters: "${search}"`
      alert(errMsg)
      throw errMsg
    }
  } else {
    const errMsg = `Current URL has no query parameters: "${window.location}"`
    alert(errMsg)
    throw errMsg
  }
}

const timestampFullShort = (): string => {
  const d = new Date()

  return `${d.getFullYear()}${twoDigit(d.getMonth() + 1)}${twoDigit(
    d.getDate(),
  )}_${twoDigit(d.getHours())}${twoDigit(d.getMinutes())}${twoDigit(
    d.getSeconds(),
  )}`
}

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

const calcRoundTurn = (raw_turn: TRawTurnId) => {
  // raw_turn is zero-indexed
  // The output round and in-round turn are one-indexed
  if (raw_turn <= 7) {
    return { round: '1', turn: `${raw_turn + 1}` }
  } else if (raw_turn <= 14) {
    return { round: '2', turn: `${raw_turn - 7}` }
  } else if (raw_turn <= 20) {
    return { round: '3', turn: `${raw_turn - 14}` }
  } else if (raw_turn <= 25) {
    return { round: '4', turn: `${raw_turn - 20}` }
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

const sleepHelper = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const waitForGameEndHelper = (timeout_step = 10) => {
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

const waitForMoveHelper = (move_num: string, timeout_step = 1) => {
  // We're waiting for the previous move's class to be viewed.
  // We use a nonzero default on the timeout_step so that it doesn't spam
  // the system if accidentally called without a timeout while
  // developing/debugging.

  const watched_move_num = `${parseInt(move_num) - 1}`

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

// ======  BASIC DATA RETRIEVAL FUNCTIONS  ======

const getIds = (): Array<string> => {
  // Scrape the player IDs out of the page

  const divs = [
    ...window.document.querySelectorAll('div[class="player-name"]'),
  ] as Array<HTMLDivElement>

  return divs.map((s) => s.id.split('_')[2])
}

const getNames = (): Array<string> => {
  // Scrape the player names out of the page

  const playerIds = getIds()

  return playerIds.map((pid) => {
    const div = window.document.querySelector(
      `div[id$="${pid}"][class="player-name"]`,
    ) as HTMLDivElement

    if (div != null) {
      if (div.textContent) {
        return div.textContent.trim()
      } else {
        const errMsg = `Empty name string found for player ID '${pid}'`
        alert(errMsg)
        throw errMsg
      }
    } else {
      const errMsg = `Player name div not found for player ID '${pid}'`
      alert(errMsg)
      throw errMsg
    }
  })
}

const getColors = (): Array<string> => {
  const playerIds = getIds()

  return playerIds.map((pid) => {
    let div = window.document.querySelector(
      `div[id$="${pid}"][class="player-name"]`,
    ) as HTMLDivElement

    if (div == null) {
      const errMsg = `Player colored name div not found for player ID '${pid}'`
      alert(errMsg)
      throw errMsg
    }

    let anchors = Array.from(div.children).filter((el) => {
      const target = el.getAttribute('target')
      return target && target == '_blank'
    }) as Array<HTMLAnchorElement>

    if (anchors.length < 1) {
      const errMsg = `No suitable anchor element for color determination for player ID '${pid}'`
      alert(errMsg)
      throw errMsg
    }

    let mch = anchors[0].style.color.match(/rgb\((\d+), (\d+), (\d+)\)/)

    if (mch == null) {
      const errMsg = `Color style information not found for player ID ${pid}`
      alert(errMsg)
      throw errMsg
    }

    let color = (
      65536 * parseInt(mch[1]) +
      256 * parseInt(mch[2]) +
      parseInt(mch[3])
    )
      .toString(16)
      .toUpperCase()

    return '#' + '0'.repeat(6 - color.length) + color
  })
}

const numPlayers = (): number => {
  return getNames().length
}

const getScores = (): Array<number> => {
  // Store at the per-player, per-turn JSON scope
  const playerIds = getIds()

  return playerIds.map((pid) => {
    const span = window.document.querySelector(
      `span[id$="${pid}"][class^="player_score"]`,
    ) as HTMLSpanElement
    if (span != null) {
      const text = span.textContent

      if (text) {
        return parseInt(text.trim())
      } else {
        const errMsg = `Score span for player ID ${pid} is empty`
        alert(errMsg)
        throw errMsg
      }
    } else {
      const errMsg = `Score span not found player ID ${pid}`
      alert(errMsg)
      throw errMsg
    }
  })
}

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
      const errMsg = `No matching player name found in move ${rmi.moveNum} text:\n\n${rmi.fullText}`
      alert(errMsg)
      throw errMsg
    }

    if (matchingNames.length > 1) {
      const errMsg = `Too many player names found in move ${rmi.moveNum} text:\n\n${rmi.fullText}`
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

const removeUndoMoves = (namedMoves: Array<TMoveInfo>): Array<TMoveInfo> => {
  // BELIEVED OBSOLETE
  // Strip out any moves that are pure undo notification moves
  return namedMoves.filter((nm) => {
    !nm.moveText.startsWith(`${nm.playerName} may undo up to this point`)
  })
}

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
      frm.moveText.match(new RegExp(`^.*?${n}\\s+places an action cube`))
    })

    if (matchingNames.length < 1) {
      const errMsg = `No matching player name found in move ${frm.moveNum} text:\n\n${frm.fullText}`
      alert(errMsg)
      throw errMsg
    }

    if (matchingNames.length > 1) {
      const errMsg = `Too many player names found in move ${frm.moveNum} text:\n\n${frm.fullText}`
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

const getWinner = () => {
  const endDiv = [...window.document.querySelectorAll('div')].filter((div) =>
    div.textContent.includes('The end of the game'),
  )[0]

  return endDiv.textContent.match(/The end of the game: (.+?) wins!/)[1]
}

// ======  STATE VALIDATION ======

const checkMoveListLength = () => {
  return getMovesList().length == numPlayers() * 26
}

const checkFullPlaySequence = () => {
  // Check to see whether the sequence of moves identified by
  // getMovesList() contains the players in the sequence as
  // expected by the actual game progression (advancement of
  // first player each round, etc.)

  const actualMoves = getMovesList()
  const actualPlayerSequence = actualMoves.map((m) => m.name)
  const orderProxy = getPlayOrderProxy(actualMoves)

  // This assembles the expected move sequence based on the core player
  // order determined by getPlayOrderProxy()
  var expectedPlayerSequence = []
  for (let round_num = 1; round_num <= 4; round_num++) {
    expectedPlayerSequence = expectedPlayerSequence.concat(
      rangeArray((9 - round_num) * numPlayers()).map(
        (i) => orderProxy[i + round_num - 1],
      ),
    )
  }

  // Now we check whether expected matches actual
  return expectedPlayerSequence.every((n, i) => {
    return n == actualPlayerSequence[i]
  })
}

// ======  PROCESSING SCORES  ======

const scrapeResults = () => {
  const results = { scores: getScores(), names: getNames() }
  return results.names.map((n, i) => {
    return { name: n, score: results.scores[i] }
  })
}

async function getScoreForMove(
  move_num,
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
  const data = []

  // These are the first turnsets of rounds 2-4, plus the last turnset,
  // falling right before the last round bonus and bonus card calculation
  const slowTurnsets = [9, 16, 22, 27]

  // Add in the very final move that can be advanced to with
  // move clicks
  moves.push(getRoundBonusMoves()[3].move)

  // Need to pack the moves with the indices
  iterable = moves.map((m, i) => {
    return [m, i]
  })

  for (const [m, i] of iterable) {
    var turnset_num = parseInt(i) + 1
    logMsg(
      `Start score retrieval for turnset ${turnset_num}, at log move ${m}...`,
    )

    var timeout_current =
      timeout_step * (slowTurnsets.includes(turnset_num) ? 3 : 1)

    logMsg(`Wait timeout is ${timeout_current} sec.`)
    result = await getScoreForMove(m, timeout_current)
    data.push({
      move: m,
      ...calcRoundTurn(i),
      scores: result,
    })
    logMsg(`Score retrieval complete for turnset ${turnset_num}.`)
  }

  return data
}

// ======  EXTENSION  ======

// Button for checking the turnset move list length
const buttonCheckMoveList = document.createElement('button')
buttonCheckMoveList.textContent = 'Check Move List'
buttonCheckMoveList.id = 'buttonCheckMoveList'
buttonCheckMoveList.style =
  'position: fixed; top: 90%; left: 10px; height: 2em; width: 10em;'
buttonCheckMoveList.addEventListener('click', () => {
  alert(checkMoveListLength())
})
document.body.appendChild(buttonCheckMoveList)

// Button for checking the player sequence in the turnset move list
const buttonCheckPlaySeq = document.createElement('button')
buttonCheckPlaySeq.textContent = 'Check Play Sequence'
buttonCheckPlaySeq.id = 'buttonCheckPlaySeq'
buttonCheckPlaySeq.style =
  'position: fixed; top: 90%; left: 11em; height: 2em; width: 12em;'
buttonCheckPlaySeq.addEventListener('click', () => {
  alert(checkFullPlaySequence())
})
document.body.appendChild(buttonCheckPlaySeq)

// Button to start score scraping
const buttonScrapeScores = document.createElement('button')
buttonScrapeScores.textContent = 'Scrape Scores'
buttonScrapeScores.id = 'buttonScrapeScores'
buttonScrapeScores.style =
  'position: fixed; top: 95%; left: 20px; height: 2em; width: 10em;'
buttonScrapeScores.addEventListener('click', () => {
  buttonScrapeScores.disabled = true
  scrapeAndSave()
})
document.body.appendChild(buttonScrapeScores)

// Input field for debug expression to evaluate
const inputDebugEval = document.createElement('input')
inputDebugEval.id = 'inputDebugEval'
inputDebugEval.type = 'text'
inputDebugEval.style =
  'position: fixed; top: 95%; left: 21em; height: 2em; width: 20em; padding-left: 0.25em; padding-right: 0.25em;'
document.body.appendChild(inputDebugEval)

// Button to trigger debug evaluate and print
const buttonDebugPrint = document.createElement('button')
buttonDebugPrint.textContent = 'Debug Print'
buttonDebugPrint.id = 'buttonDebugPrint'
buttonDebugPrint.style =
  'position: fixed; top: 95%; left: 13em; height: 2em; width: 8em;'
buttonDebugPrint.addEventListener('click', () => {
  try {
    const result = eval(inputDebugEval.value)
    alert(JSON.stringify(result))
  } catch (error) {
    alert(`Error: ${error.message}`)
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

const reportCurrentScores = () => {
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

  const outerData = {}

  outerData.data = data
  outerData.table = tableNum()
  outerData.timestamp = timestampFullShort()
  outerData.colors = getNames().map((n, i) => {
    return { name: n, color: getColors()[i] }
  })
  outerData.first_turns = getFirstTurns()
  outerData.winner = getWinner()

  download(
    `${tableNum()}-${timestampFullShort()}.json`,
    JSON.stringify(outerData),
  )
  download(
    `${tableNum()}-${timestampFullShort()}.b64`,
    btoa(JSON.stringify(outerData)),
  )
}
