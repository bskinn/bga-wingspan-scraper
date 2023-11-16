import { getScores } from '@/data/scores'
import { getIds, getNames } from '@/data/table'

import { twoDigit } from './string'

export const logMsg = (msg: string): void => {
  const now = new Date()

  const tstamp = `${twoDigit(now.getHours())}:${twoDigit(
    now.getMinutes(),
  )}:${twoDigit(now.getSeconds())}`

  console.log(`SCORE SCRAPE [${tstamp}]: ${msg}`)
} // ======  PUBLIC API  ======

export const reportCurrentScores = (): void => {
  const names = getNames()
  const scores = getScores()

  console.log(`${names.join()}\n${scores.join()}`)
}
// ======  PUBLIC API  ======

export const printNameInfo = () => {
  getNames().forEach((n, i) => {
    console.log(`${n}: ${getIds()[i]}`)
  })
}
