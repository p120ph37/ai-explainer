/**
 * Editorial mode client entry point
 * 
 * This module is only loaded when editorial mode is active.
 * It provides the EditorialLayer component and related utilities.
 */

export { EditorialLayer } from './components/EditorialLayer.tsx';
export { isEditorialMode } from './state.ts';
export { editorialApi } from './api.ts';

// Re-export types
export type {
  EditorialNote,
  EditorialState,
  PageVariant,
  PageVariants,
  NoteAnchor,
  NoteStatus,
  NotePriority,
  TextSelectionAnchor,
} from '../_types.ts';

