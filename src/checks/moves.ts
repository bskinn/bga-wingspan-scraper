import { numPlayers } from '../data/table'
import { rangeArray } from '../helpers/array'
import { getMovesList, getPlayOrderProxy } from '../data/moves'

export const checkMoveListLength = (): boolean => {
  return getMovesList().length == numPlayers() * 26
}

export const checkFullPlaySequence = (): boolean => {
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
