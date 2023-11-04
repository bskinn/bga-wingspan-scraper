export type TScoreScrapeSingleScore = {
  name: string
  score: number
}

export type TScoreScrapeData = {
  move: string
  round: string
  turn: string
  scores: Array<TScoreScrapeSingleScore>
}

export type TRawMoveInfo = {
  fullText: string
  moveNum: string
  dateStr: string
  moveText: string
}

export type TMoveInfo = {
  moveNum: string
  playerName: string
  moveText: string
  fullText: string
}
