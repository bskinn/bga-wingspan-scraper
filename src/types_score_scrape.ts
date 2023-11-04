import { TMoveId, TRoundId, TTurnId } from './types_misc'

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
