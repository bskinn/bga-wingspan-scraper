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

export type TMoveInfo = {
  fullText: string
  moveNum: string
  dateStr: string
  moveText: string
}
