// ======  CONSTANTS  ======
BONUS_TURN_ID = 'B'
BONUS_CARD_TURN_ID = 'C'
GAME_END_TURN_ID = 'G'

NO_MOVE_NUM = 'NONE'

DEFAULT_MOVE_WAIT_POLL = 15 // seconds
DEFAULT_ENDGAME_WAIT = 90 // seconds (1.5 min)

// ======  DEV HELPERS  ======

devRoundStartScores = [
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

const createArrayCycleProxy = (arr) => {
  return new Proxy(arr, {
    get: (target, prop) => {
      return target[prop % arr.length]
    },
  })
}

// ======  UTILITY FUNCTIONS  ======
const twoDigit = (val) => {
  return parseInt(val) >= 10 ? val : '0' + parseInt(val)
}

const logMsg = (msg) => {
  const now = new Date()

  const tstamp = `${twoDigit(now.getHours())}:${twoDigit(
    now.getMinutes(),
  )}:${twoDigit(now.getSeconds())}`

  console.log(`SCORE SCRAPE [${tstamp}]: ${msg}`)
}

const rangeArray = (len, start = 0, step = 1) => {
  return Array.from(Array(len).keys(), (k) => start + step * k)
}

const tableNum = () => {
  return window.location.search.match(/[?&]table=(\d+)(&|$)/)[1]
}

const timestampFullShort = () => {
  const d = new Date()

  return `${d.getFullYear()}${twoDigit(d.getMonth() + 1)}${twoDigit(
    d.getDate(),
  )}_${twoDigit(d.getHours())}${twoDigit(d.getMinutes())}${twoDigit(
    d.getSeconds(),
  )}`
}

const extractRoundBonusScore = (name, text) => {
  return parseInt(
    text.match(
      new RegExp(`Action cubes.+?${name}.+?scor[^\\s]+\\s+(\\d+)\\s+point`),
    )[1],
  )
}

const extractBonusCardScore = (name, text) => {
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

const calcRoundTurn = (raw_turn) => {
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
    throw new Error('Raw turn index out of bounds')
  }
}

// ======  MOVE STATE CONTROL  ======

const advanceToMove = (move_num) => {
  window.document
    .querySelectorAll(`div[id="replaylogs_move_${move_num}"]`)[0]
    .click()
}

const advanceToGameEnd = () => {
  window.document.querySelectorAll('a[id="archive_end_game"]')[0].click()
  window.document.querySelectorAll('a[id="go_to_game_end_slow"]')[0].click()
}

// ======  DATA EXPORT  ======

// From https://stackoverflow.com/a/18197341/4376000
function download(filename, text) {
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

const sleepHelper = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const waitForGameEndHelper = (timeout_step = 10) => {
  logMsg('Waiting for game end...')

  function waiter(resolve) {
    if (
      [...window.document.querySelectorAll('span')].some((span) =>
        span.textContent.includes('End of game'),
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

const waitForMoveHelper = (move_num, timeout_step = 1) => {
  // We're waiting for the previous move's class to be viewed.
  // We use a nonzero default on the timeout_step so that it doesn't spam
  // the system if accidentally called without a timeout while
  // developing/debugging.

  const watched_move_num = `${parseInt(move_num) - 1}`

  logMsg(`Watching move ${watched_move_num}.`)

  function finisher(resolve) {
    resolve()
  }

  function waiter(resolve) {
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

const getIds = () => {
  var ids = []

  window.document
    .querySelectorAll('div[class="player-name"]')
    .forEach((s) => ids.push(s.id.split('_')[2]))

  return ids
}

const getNames = () => {
  const ids = getIds()
  var names = []

  ids.forEach((s) =>
    names.push(
      window.document
        .querySelectorAll(`div[id$="${s}"][class="player-name"]`)[0]
        .textContent.trim(),
    ),
  )

  return names
}

const getColors = () => {
  const ids = getIds()

  return ids.map((s) => {
    let div = window.document.querySelectorAll(
      `div[id$="${s}"][class="player-name"]`,
    )[0]
    let a = Array.from(div.children).filter((el) => el.target == '_blank')[0]
    let mch = a.style.color.match(/rgb\((\d+), (\d+), (\d+)\)/)

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

const numPlayers = () => {
  return getNames().length
}

const getScores = () => {
  // Store at the per-player, per-turn JSON scope
  const ids = getIds()
  var scores = []

  ids.forEach((s) =>
    scores.push(
      parseInt(
        window.document
          .querySelectorAll(`span[id$="${s}"][class^="player_score"]`)[0]
          .textContent.trim(),
      ),
    ),
  )

  return scores
}

// ======  MOVE RETRIEVAL AND PROCESSING  ======

const getMoveInfo = () => {
  var moveInfo = []

  // First element is the entire match.
  // Second is the move number.
  // Third, if present, is the date.
  // Fourth is the full text of the move message.
  window.document
    .querySelectorAll('div[id^="replaylogs_move_"]')
    .forEach((s) =>
      moveInfo.push(
        s.textContent.match(
          /Move (\d+)\s+:([0-9]+\/[0-9]+\/[0-9]+\s*)?[0-9:]+\s*[AP]M(.+)/,
        ),
      ),
    )

  return moveInfo
}

const getNamedMoves = (moveInfo) => {
  // BELIEVED OBSOLETE
  // Returns object
  // move: Move number
  // name: Player name
  // msg: Log message
  // text: Full text match

  var names = getNames()
  var namedMoves = []

  moveInfo.forEach((mi) => {
    if (mi != null) {
      names.forEach((n) => {
        if (mi[3].startsWith(n)) {
          namedMoves.push({ move: mi[1], name: n, msg: mi[3], text: mi[0] })
        }
      })
    }
  })

  return namedMoves
}

const removeUndoMoves = (namedMoves) => {
  // BELIEVED OBSOLETE
  // Strip out any moves that are pure undo notification moves
  var filteredMoves = []

  namedMoves.forEach((nm) => {
    if (!nm.msg.startsWith(`${nm.name} may undo up to this point`)) {
      filteredMoves.push(nm)
    }
  })

  return filteredMoves
}

const removeRepeatMoves = (namedMoves) => {
  // BELIEVED OBSOLETE
  // Pass the moves list through after undos are stripped out
  // Skip the first move entirely, it will be the discard move
  //
  var filteredMoves = [namedMoves[1]]

  for (let i = 2; i < namedMoves.length; i++) {
    if (namedMoves[i].name != namedMoves[i - 1].name) {
      filteredMoves.push(namedMoves[i])
    }
  }

  return filteredMoves
}

const getActionCubeMoves = (movesList) => {
  // Trying a different tack on the moves list
  // Returns object
  // move: Move number
  // name: Player name
  // msg: Log message
  // text: Full text match
  var names = getNames()

  const filteredMoves = movesList.filter((m) =>
    m[3].match(/places an action cube/),
  )

  const filteredObjs = filteredMoves.map((m) => {
    return { move: m[1], msg: m[3], text: m[0] }
  })

  for (fo of filteredObjs) {
    var name = names.filter((n) =>
      fo.msg.match(new RegExp(`^.*?${n}\\s+places an action cube`)),
    )[0]
    fo.name = name
  }

  return filteredObjs
}

const getMovesList = () => {
  // This is the fully prepared moves list that most functions
  // should work with
  // return removeRepeatMoves(removeUndoMoves(getNamedMoves(getMoveInfo())))
  return getActionCubeMoves(getMoveInfo())
}

const getMoveIds = (movesList) => {
  var moveIds = movesList.map((m) => m.move)
  return moveIds.sort((a, b) => {
    return Math.sign(parseInt(a) - parseInt(b))
  })
}

const getTurnsetStartMoveIds = (moveIds) => {
  return rangeArray(26).map((i) => {
    return moveIds[i * numPlayers()]
  })
}

const getPlayOrderProxy = (movesList) => {
  return createArrayCycleProxy(
    movesList.slice(0, getNames().length).map((m) => m.name),
  )
}

// ======  ROUND BONUS HANDLING  ======

const getRoundBonusMoves = () => {
  // Returns object
  // move: Move number
  // name: Player name
  // text: Full text match

  var bonusMoves = []

  getMoveInfo().forEach((mi) => {
    if (mi != null) {
      if (mi[3].includes('Action cubes are returned')) {
        bonusMoves.push({ move: mi[1], name: 'RoundBonus', text: mi[0] })
      }
    }
  })

  return bonusMoves
}

const calcAndAddRoundEndScores = (scoreData, round) => {
  // Subtracting the round bonus scores from the scores at the
  // start of the next round, to get the scores prior to the
  // round bonuses, for rounds 1-3.
  // Round 4 needs special treatment because of the end of
  // game behavior; handled as part of calcAndAddGameEndScores().

  const names = getNames()

  // Scores at the start of the next round
  const nextScores = scoreData.find(
    (obj) => obj.round == round + 1 && obj.turn == 1,
  )

  // Text of the relevant round bonus move. We subtract one since the
  // JS array object is zero-indexed.
  const bonusMove = getRoundBonusMoves()[round - 1]

  // Initialize the score entry object
  const newEntry = {
    move: bonusMove.move,
    round: `${round}`,
    turn: BONUS_TURN_ID,
    scores: [],
  }

  names.forEach((name) => {
    let nextScore = nextScores.scores.find((obj) => obj.name == name).score
    let roundBonusScore = extractRoundBonusScore(name, bonusMove.text)

    // Calculate the math but keep the result as a string since that's
    // how everything is (for now)
    let roundEndScore = nextScore - roundBonusScore

    // Push the calculated score into the score entry object
    newEntry.scores.push({ name: name, score: roundEndScore })
  })

  // Push the new score entry object into the overall data
  scoreData.push(newEntry)
}

const calcAndAddGameEndScores = (scoreData) => {
  // Parse the final round-end move text for both the
  // R4 round bonuses and the bonus card bonuses
  //

  // Get the end of game move text and the names list
  const finalMoveText = getRoundBonusMoves()[3].text
  const names = getNames()
  const referenceScores = scoreData.find(
    (obj) => obj.round == '4' && obj.turn == BONUS_TURN_ID,
  )
  logMsg(referenceScores)

  // Initialize score objects for after round bonuses and for
  // end of game score
  const roundBonusScores = {
    move: NO_MOVE_NUM,
    round: '4',
    turn: BONUS_CARD_TURN_ID,
    scores: [],
  }
  const endGameScores = {
    move: NO_MOVE_NUM,
    round: '4',
    turn: GAME_END_TURN_ID,
    scores: [],
  }

  names.forEach((name) => {
    // Get the relevant scores
    var roundScore = extractRoundBonusScore(name, finalMoveText)
    var cardScore = extractBonusCardScore(name, finalMoveText)
    var refScore = referenceScores.scores.find((obj) => obj.name == name).score

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

const calcAndAddAllEndScores = (scoreData) => {
  // scoreData should be the output from getTurnsetScores(),
  // or a simulation of it
  for (const round of rangeArray(3, 1)) {
    calcAndAddRoundEndScores(scoreData, round)
  }

  calcAndAddGameEndScores(scoreData)
}

// ======  FIXING ANY LAST-TURN GLITCHES  ======

const correctLastTurnGlitches = (scoreData) => {
  // Assumes we've been advanced to the endgame state
  // Collect the scores
  const endGameActualData = scrapeResults()

  // Pluck the end-game scores from the passed score data
  const endGameCalcData = scoreData.find(
    (sd) => sd.round == '4' && sd.turn == GAME_END_TURN_ID,
  ).scores

  // Loop over the player names, calculate the difference between
  // the actual and calculated end-game scores for each player,
  // and add that difference to all of the pre-round bonus, pre-bonus card,
  // and end-game scores. This can happen if a final bit of points from the
  // last turn is included in the round-bonus move in the replay log
  // (e.g., when a bird that lays eggs in everyone's habitat is used
  // on that last turn of the game; see game 416620972)
  getNames().forEach((name) => {
    var actual = endGameActualData.find((s) => s.name == name)
    var calc = endGameCalcData.find((s) => s.name == name)

    var diff = parseInt(actual.score) - parseInt(calc.score)

    logMsg(`Endgame glitch calc for ${name}: ${diff}`)

    for (turn_id of [BONUS_TURN_ID, BONUS_CARD_TURN_ID, GAME_END_TURN_ID]) {
      let workingScores = scoreData.find(
        (sd) => sd.round == '4' && sd.turn == turn_id,
      ).scores

      let working = workingScores.find((s) => s.name == name)

      // Scores are Numbers now
      working.score += diff
    }
  })
}

// ======  FINDING FIRST-TURNS  ======

const getFirstTurns = () => {
  const firstMove = getMovesList()[0]
  const firstMoveName = firstMove.msg.match(/^(.+?) places/)[1]

  const firstTurns = { 1: firstMoveName }

  rangeArray(3, 2).forEach((round) => {
    let workingDiv = [...window.document.querySelectorAll('div')]
      .filter((div) => div.textContent.includes('is now first player'))
      .filter((div) => div.textContent.includes(`Round ${round}`))[0]

    firstTurns[round] = workingDiv.textContent.match(
      new RegExp(`Round ${round}: (.+?) is now first player`),
    )[1]
  })

  return firstTurns
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