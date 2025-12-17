/**
 * Editorial mode client entry point
 * 
 * This module is only loaded when editorial mode is active.
 * It provides the EditorialLayer component and related utilities.
 */

export { EditorialLayer } from '@/editorial/client/components/EditorialLayer.tsx';
export { isEditorialMode } from '@/editorial/client/state.ts';
export { editorialApi } from '@/editorial/client/api.ts';

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
} from '@/editorial/_types.ts';

