import type { TPixelValues } from '@/types/types-ids'

const getXYPixelValues = (xyString: string): TPixelValues => {
  const mch = xyString.match(/(-?\d+)px\s+(-?\d+)px/)

  if (mch === null) {
    const errMsg = `Regex failed to match in getXYPixelValues on string:\n\n${xyString}`
    alert(errMsg)
    throw errMsg
  }

  return { x: parseFloat(mch[1]), y: parseFloat(mch[2]) }
}
export const calcCardIndex = (
  div: HTMLDivElement,
  numCols: number,
  numRows: number,
) => {
  // Calculate the 1-D index of a card from the given div
  // Assumes row-major order
  const resizeData = getComputedStyle(div).backgroundSize
  const offsetData = getComputedStyle(div).backgroundPosition

  const resizeXY = getXYPixelValues(resizeData)
  const offsetXY = getXYPixelValues(offsetData)

  const xOffset = Math.round((-1 * numCols * offsetXY.x) / resizeXY.x)
  const yOffset = Math.round((-1 * numRows * offsetXY.y) / resizeXY.y)

  return xOffset + numCols * yOffset
}
