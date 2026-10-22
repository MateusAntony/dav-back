/**
 * Enum to represent access permissions for diagrams.
 * Each permission level grants different rights to the user.
 */
export enum AccessPermission {
  /**
   * VIEWER: Can only view the diagram.
   * Does not have permission to make any changes.
   */
  VIEWER,

  /**
   * REVIEWER: Has permission to comment on the diagram.
   * Can view and comment on the diagram but cannot make direct changes to it.
   */
  REVIEWER,

  /**
   * EDITOR: Has permission to edit the diagram.
   * Can make changes to the diagram but cannot delete it.
   */
  EDITOR,
}
