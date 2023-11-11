import { twoDigit } from './helpers/string'

export const logMsg = (msg: string): void => {
  const now = new Date()

  const tstamp = `${twoDigit(now.getHours())}:${twoDigit(
    now.getMinutes(),
  )}:${twoDigit(now.getSeconds())}`

  console.log(`SCORE SCRAPE [${tstamp}]: ${msg}`)
}
