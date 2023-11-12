import { TMoveId, TRoundId, TTurnId } from './types-ids'

export type TScoreScrapeSingleScore = {
  name: string
  score: number
}

export type TScoreScrapeData = {
  move: TMoveId
  round: TRoundId
  turn: TTurnId
  scores: Array<TScoreScrapeSingleScore>
}

export type TColorData = {
  name: string
  color: string
}

export type TCompleteScoreScrapeData = {
  data: Array<TScoreScrapeData>
  table: string
  timestamp: string
  colors: Array<TColorData>
  first_turns: TFirstTurnList
  winner: string
}

export type TRawMoveInfo = {
  fullText: string
  moveNum: TMoveId
  dateStr: string
  moveText: string
}

export type TMoveInfo = {
  moveNum: TMoveId
  playerName: string
  moveText: string
  fullText: string
}

export type TRoundBonusMoveName = 'RoundBonus'

export type TRoundBonusMoveInfo = {
  moveNum: TMoveId
  name: TRoundBonusMoveName
  fullText: string
}

export type TFirstTurnList = {
  [key in TRoundId]: string
}

export type TFirstTurnListPartial = Partial<TFirstTurnList>

export type TRoundTurnInfo = {
  round: TRoundId
  turn: TTurnId
}
