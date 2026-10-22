/**
 * Font size range based on user severity of vision impairment
 */
export enum FontSizeRange {
  /**
   * DEFAULT: Will be applied for both None and Blindness severity of vision impairment
   */
  DEFAULT = '12-14',
  MILD = '16-18',
  MODERATE = '18-24',
  NEAR = '16-20',
  SEVERE = '24-32',
}

/**
 * Interface Contrast Options
 */
export enum InterfaceContrast {
  DEFAULT,
  /** High Contrast Options */
  HIGH_CONTRAST_BLUE_YELLOW,
  HIGH_CONTRAST_BLACK_WHITE,
}
