import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import JukeBoxArea from './JukeBoxArea';
import { Song, TownEmitter, Track } from '../types/CoveyTownSocket';

describe('JukeBoxArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: JukeBoxArea;
  const townEmitter = mock<TownEmitter>();
  let newPlayer: Player;
  const id = nanoid();
  const song2: Song = {
    title: 'test song2',
    artists: ['test artist2'],
    spotifyId: 'test spotifyId2',
    addedBy: 'test addedBy2',
    upvotes: 2,
    songJson: {
      id: 'testId',
      name: 'testName',
      artists: [],
      album: { id: 'testId', name: 'testAlbumName' },
    } as Track,
  };
  const song3: Song = {
    title: 'test song3',
    artists: ['test artist3'],
    spotifyId: 'test spotifyId3',
    addedBy: 'test addedBy3',
    upvotes: 3,
    songJson: {
      id: 'testId',
      name: 'testName',
      artists: [],
      album: { id: 'testId', name: 'testAlbumName' },
    } as Track,
  };
  const songQueue: Song[] = [song2, song3];

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new JukeBoxArea({ id, songQueue }, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });

  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ id, songQueue });
    });
    it("Clears the player's conversationLabel and emits an update for their location", () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
    it('Clears the songqueue when the last occupant leaves', () => {
      testArea.remove(newPlayer);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        songQueue: [],
      });
    });
  });
  describe('add', () => {
    it('Adds the player to the occupants list', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);
    });
    it("Sets the player's conversationLabel and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });
  test('toModel sets the ID, queue, song, isPlaying and elapsedTimeSec', () => {
    const model = testArea.toModel();
    expect(model).toEqual({
      id,
      songQueue,
    });
  });
  test('updateModel sets queue, currentSong, isPlaying and elapsedTimeSec', () => {
    testArea.updateModel({
      id: 'ignore',
      songQueue: [song3],
    });
    expect(testArea.id).toBe(id);
  });
  describe('fromMapObject', () => {
    it('Throws an error if the width or height are missing', () => {
      expect(() =>
        JukeBoxArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Creates a new jukebox area using the provided boundingBox and id, with isPlaying defaulting to false and progress to 0, and emitter', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = JukeBoxArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(val.occupantsByID).toEqual([]);
    });
  });
});
