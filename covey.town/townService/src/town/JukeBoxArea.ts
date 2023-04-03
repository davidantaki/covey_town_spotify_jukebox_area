import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  BoundingBox,
  TownEmitter,
  JukeBoxArea as JukeBoxAreaModel,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import Song from '../lib/Song';

export default class JukeBoxArea extends InteractableArea {
  private _songQueue: Song[];

  public get songQueue() {
    return this._songQueue;
  }

  /**
   * Creates a new JukeBoxArea
   *
   * @param jukeBoxArea model containing this area's starting state
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, songQueue }: JukeBoxAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._songQueue = songQueue;
  }

  /**
   * Removes a player from this viewing area.
   *
   * When the last player leaves, this method clears the video of this area and
   * emits that update to all of the players
   *
   * @param player
   */
  public remove(player: Player): void {
    super.remove(player);
    if (this._occupants.length === 0) {
      this._songQueue = [];
      this._emitAreaChanged();
    }
  }

  /**
   * Updates the state of this ViewingArea, setting the video, isPlaying and progress properties
   *
   * @param viewingArea updated model
   */
  public updateModel(updatedModel: JukeBoxAreaModel) {
    this._songQueue = updatedModel.songQueue;
  }

  /**
   * Convert this ViewingArea instance to a simple ViewingAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): JukeBoxAreaModel {
    return {
      id: this.id,
      songQueue: this._songQueue,
    };
  }

  /**
   * Creates a new ViewingArea object that will represent a Viewing Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this viewing area exists
   * @param townEmitter An emitter that can be used by this viewing area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): JukeBoxArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new JukeBoxArea({ id: name, songQueue: [] }, rect, townEmitter);
  }
}
