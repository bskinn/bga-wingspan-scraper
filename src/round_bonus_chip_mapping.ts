import type { TRoundBonusChipId } from './types'

const ROUND_BONUS_CHIP_MAPPING: { [key in TRoundBonusChipId]: string } = {
  0: 'Eggs in Bowl Nests',
  1: 'Eggs in Cavity Nests',
  2: 'Eggs in Ground Nests',
  3: 'Eggs in Platform Nests',
  4: 'Birds in Forest',
  5: 'Birds in Grassland',
  6: 'Birds in Wetland',
  7: 'Total Birds',
  8: 'Bowl Nest Birds w/Eggs',
  9: 'Cavity Nest Birds w/Eggs',
  10: 'Ground Nest Birds w/Eggs',
  11: 'Platform Nest Birds w/Eggs',
  12: 'Eggs in Forest',
  13: 'Eggs in Grassland',
  14: 'Eggs in Wetland',
  15: 'Sets of Eggs Across Habitat',
}

export default ROUND_BONUS_CHIP_MAPPING
