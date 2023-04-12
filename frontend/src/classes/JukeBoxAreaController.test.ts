import TownController from './TownController';
import JukeBoxAreaController, { JukeBoxAreaEvents, Song } from './JukeBoxAreaController';
import { MockProxy, mock, mockClear } from 'jest-mock-extended';
import { JukeBoxArea, Track } from '../types/CoveyTownSocket';

describe('Jukebox Song Queue', () => {
  let testJukeBoxArea: JukeBoxArea;
  let testJukeBoxController: JukeBoxAreaController;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<JukeBoxAreaEvents>();

  beforeEach(() => {
    testJukeBoxArea = {
      id: 'testArea',
      songQueue: [
        {
          title: 'test',
          artists: ['test'],
          spotifyId: 'spotify:id',
          addedBy: 'test',
          upvotes: 0,
          songJson: {
            id: 'testId',
            name: 'testName',
            artists: [],
            album: { id: 'testId', name: 'testAlbumName' },
          } as Track,
        },
      ],
    };
    testJukeBoxController = new JukeBoxAreaController(testJukeBoxArea);
    mockClear(townController);
    mockClear(mockListeners.jukeBoxQueueChange);

    testJukeBoxController.addListener('jukeBoxQueueChange', mockListeners.jukeBoxQueueChange);
  });

  describe('Song queue change', () => {
    it('song queue change', () => {
      const song: Song = {
        title: 'another song',
        artists: ['artist'],
        spotifyId: 'some:spotify:id',
        addedBy: 'tester',
        upvotes: 1,
        songJson: {
          id: 'some:spotify:id',
          name: 'another song',
          artists: [
            {
              id: 'artist:id',
              name: 'artist',
            },
          ],
          album: {
            id: 'album:id',
            name: 'album name',
          },
        },
      };
      const newQueue = [...testJukeBoxController.queue];
      newQueue.push(song);
      testJukeBoxController.queue = newQueue;
      expect(mockListeners.jukeBoxQueueChange).toBeCalledWith(newQueue);
      expect(testJukeBoxController.queue).toBe(newQueue);
    });

    it('should not emit a song queue change if nothing changed', () => {
      testJukeBoxController.queue = testJukeBoxArea.songQueue;
      expect(mockListeners.jukeBoxQueueChange).not.toBeCalled();
    });
  });
});
