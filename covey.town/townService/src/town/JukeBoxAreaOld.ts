import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  BoundingBox,
  JukeBoxArea as JukeBoxAreaModel,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class JukeBoxArea extends InteractableArea {
  public songQueue?: string[];

  /** The conversation area is "active" when there are players inside of it  */
  public get isActive(): boolean {
    return this._occupants.length > 0;
  }

  /**
   * Creates a new JukeBoxArea
   *
   * @param jukeBoxAreaModel model containing this area's current topic and its ID
   * @param coordinates  the bounding box that defines this JukeBoxArea
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, songQueue }: JukeBoxAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this.songQueue = songQueue;
  }

  /**
   * Removes a player from this conversation area.
   *
   * Extends the base behavior of InteractableArea to set the topic of this ConversationArea to undefined and
   * emit an update to other players in the town when the last player leaves.
   *
   * @param player
   */
  public remove(player: Player) {
    super.remove(player);
    if (this._occupants.length === 0) {
      this.songQueue = undefined;
      this._emitAreaChanged();
    }
  }

  /**
   * Convert this ConversationArea instance to a simple ConversationAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): JukeBoxAreaModel {
    return {
      id: this.id,
      songQueue: this.songQueue,
    };
  }

  /**
   * Creates a new ConversationArea object that will represent a Conversation Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this conversation area exists
   * @param broadcastEmitter An emitter that can be used by this conversation area to broadcast updates
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): JukeBoxArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new JukeBoxArea({ id: name, occupantsByID: [] }, rect, broadcastEmitter);
  }
}
