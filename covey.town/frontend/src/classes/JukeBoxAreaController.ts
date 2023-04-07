import { EventEmitter } from 'events';
import TypedEventEmitter from 'typed-emitter';
import { JukeBoxArea as JukeBoxAreaModel } from '../types/CoveyTownSocket';

export interface Song {
  title: string;
  artists: string[];
  spotifyId: string;
  addedBy: string;
  upvotes: number;
  songJson: any;
}

export function createSong(addedBy: string, songJson: any): Song {
  const title: string = songJson.name;
  const artists: string[] = songJson.artists.map((artist: { name: string }) => artist.name);
  const spotifyId: string = songJson.id;
  const upvotes = 0;
  const downvotes = 0;

  return {
    title,
    artists,
    spotifyId,
    addedBy,
    upvotes,
    songJson: { ...songJson },
  };
}

/**
 * The events that a JukeBoxAreaController can emit
 */
export type JukeBoxAreaEvents = {
  /**
   * A queueChange event indicates that the song queue has changed.
   * Listeners are passed the new state in the updated queue.
   */
  jukeBoxQueueChange: (queue: Song[]) => void;
};

/**
 * A JukeBoxAreaController manages the state for a JukeBoxArea in the frontend app, serving as a bridge between the Spotify
 * song queue displayed in the front end and the backend TownService, and ensuring that star updates are
 * synchronized across all the players looking at the juke box area.
 *
 * The JukeBoxAreaController implements callbacks that handle events from the song queue in this browser window, and
 * emits updates when the state is updated, @see JukeBoxAreaEvents
 */
export default class JukeBoxAreaController extends (EventEmitter as new () => TypedEventEmitter<JukeBoxAreaEvents>) {
  private _model: JukeBoxAreaModel;

  /**
   * Constructs a new JukeBoxAreaController, initialized with the state of the
   * provided jukeBoxAreaModel.
   *
   * @param JukeBoxAreaModel The juke box area model that this controller should represent
   */
  constructor(jukeBoxAreaModel: JukeBoxAreaModel) {
    super();
    this._model = jukeBoxAreaModel;
  }

  /**
   * The ID of the juke box area represented by this juke box area controller
   * This property is read-only: once a JukeBoxAreaController is created, it will always be
   * tied to the same juke box area ID.
   */
  public get id(): string {
    return this._model.id;
  }

  public get queue(): Song[] {
    return this._model.songQueue;
  }

  public set queue(queue: Song[]) {
    this._model.songQueue = queue;
    this.emit('jukeBoxQueueChange', queue);
  }

  /**
   * @returns JukeBoxAreaModel that represents the current state of this JukeBoxAreaController
   */
  public jukeBoxAreaModel(): JukeBoxAreaModel {
    return this._model;
  }

  /**
   * Applies updates to this juke box area controller's model, setting the fields
   * image, stars, and title from the updatedModel
   *
   * @param updatedModel
   */
  public updateFrom(updatedModel: JukeBoxAreaModel): void {
    // note: this calls the setters; really we're updating the model
    this.queue = updatedModel.songQueue;
  }
}

// export function useSongQueue(controller: JukeBoxAreaController): Song[] | undefined {
//   const res: Song[] = [];

//   useEffect(() => {
//     function addSong(queue: Song[]) {
//       res.push(queue);
//     }
//     controller.addListener('jukeBoxQueueChange', addSong);
//     return () => {
//       controller.removeListener('jukeBoxQueueChange', addSong);
//     };
//   });

//   return res;
// }
