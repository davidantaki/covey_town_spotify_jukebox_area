import { ConversationArea, Interactable, JukeBoxArea, ViewingArea } from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return 'occupantsByID' in interactable;
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return 'isPlaying' in interactable;
}

export function isJukeBoxArea(interactable: Interactable): interactable is JukeBoxArea {
  return 'songQueue' in interactable;
}
