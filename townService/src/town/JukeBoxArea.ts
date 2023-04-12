import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  Song,
  BoundingBox,
  TownEmitter,
  JukeBoxArea as JukeBoxAreaModel,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class JukeBoxArea extends InteractableArea {
  private _songQueue: Song[];

  public get songQueue() {
    return this._songQueue;
  }

  /**
   * Creates a new JukeBoxArea
   *
   * @param jukeBoxArea model containing this area's starting state
   * @param coordinates the bounding box that defines this juke box area
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
   * Removes a player from this juke box area.
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
   * Updates the state of this JukeBoxArea, setting the songQueue
   *
   * @param jukeBoxArea updated model
   */
  public updateModel(updatedModel: JukeBoxAreaModel) {
    this._songQueue = updatedModel.songQueue;
  }

  /**
   * Convert this JukeBoxArea instance to a simple JukeBoxAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): JukeBoxAreaModel {
    return {
      id: this.id,
      songQueue: this._songQueue,
    };
  }

  /**
   * Creates a new JukeBoxArea object that will represent a Juke box Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this juke box area exists
   * @param townEmitter An emitter that can be used by this juke box area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): JukeBoxArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed juke box area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new JukeBoxArea({ id: name, songQueue: [] }, rect, townEmitter);
  }
}
