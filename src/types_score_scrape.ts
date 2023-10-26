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
