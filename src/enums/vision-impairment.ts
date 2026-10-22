/**
 * Classification of severity of vision impairment based on visual acuity in the better eye.
 * Categories are based on the World report on vision, 2019, World Health Organization, page 11.
 */

export enum VisionImpairment {
  /**
   * Mild Vision Impairment: Visual acuity in the better eye between 6/18 and 6/12.
   * Some difficulty in recognizing objects, faces, or reading small print.
   */
  MILD,

  /**
   * Moderate Vision Impairment: Visual acuity in the better eye between 6/18 and 6/60.
   * Difficulty in recognizing faces, reading, and performing daily tasks without assistance.
   */
  MODERATE,

  /**
   * Severe Vision Impairment: Visual acuity in the better eye between 6/60 and 3/60.
   * Significant difficulty in recognizing faces, reading, and performing daily tasks without assistance.
   */
  SEVERE,

  /**
   * Blindness: Visual acuity in the better eye less than 3/60.
   * Unable to recognize faces, read, or perform daily tasks without significant assistance or adaptive devices.
   */
  BLINDNESS,

  /**
   * Near Vision Impairment: Difficulty in reading or seeing objects close-up.
   * Often due to age-related changes or conditions like presbyopia.
   */
  NEAR,

  /**
   * None: No vision impairment present.
   * Visual acuity in the better eye is within normal range (6/6 or better).
   */
  NONE,
}
