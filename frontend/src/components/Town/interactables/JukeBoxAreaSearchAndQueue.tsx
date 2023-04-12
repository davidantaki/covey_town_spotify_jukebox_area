/// <reference types='@types/spotify-web-playback-sdk' />;
import {
  Center,
  Grid,
  GridItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Song } from '../../../classes/JukeBoxAreaController';
import { useInteractable, useJukeBoxAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import SpotifyController from '../../../spotify/SpotifyController';
import { JukeboxSpotifyLogin } from '../Login';
import { QueueView } from '../QueueView';
import { SpotifySearchResult } from '../SpotifySearchResult';
import JukeBoxAreaInteractable from './JukeBoxArea';

export interface SearchItemType {
  id: string;
  name: string;
  artists: { name: string }[];
  duration_ms: string;
  uri: string;
}

export interface SearchResultsType {
  tracks: {
    items: SearchItemType[];
  };
}

export class MockReactPlayer extends ReactPlayer {
  render(): React.ReactNode {
    return <></>;
  }
}

/**
 * The SearchAndQueue component renders the Search and the Queue for the JukeboxInteractable.
 * @param props: A list of properties searchValue, handleSearchChange, findSongs, upVoteSong, searchResults,
 * addToSongQueue, sortedQueue, authToken, currentTrack. All of which either describe what they are or what they
 * do in plain english.
 */
export function SearchAndQueue({
  searchValue,
  handleSearchChange,
  findSongs,
  upvoteSong,
  searchResults,
  addSongToQueue,
  sortedQueue,
  authToken,
  currentTrack,
}: {
  searchValue: string;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  findSongs: () => void;
  upvoteSong: (songId: string) => void;
  searchResults: SearchResultsType | undefined;
  addSongToQueue: (song: Song) => void;
  sortedQueue: Song[];
  authToken: string;
  currentTrack: Song | undefined;
}): JSX.Element {
  return (
    <Grid templateColumns='repeat(51, 1fr)' templateRows='repeat(1fr, 2)'>
      <SpotifySearchResult
        searchValue={searchValue}
        handleSearchChange={handleSearchChange}
        findSongs={findSongs}
        searchResults={searchResults}
        addSongToQueue={addSongToQueue}></SpotifySearchResult>
      <GridItem colSpan={1} bg={'black'} width={'10%'} justifySelf='center'></GridItem>
      <QueueView
        upvoteSong={upvoteSong}
        sortedQueue={sortedQueue}
        authToken={authToken}
        currentTrack={currentTrack}></QueueView>
    </Grid>
  );
}

/**
 * The JukeboxArea monitors the player's interaction with a JukeboxArea on the map: displaying a screen
 * that consists of the login page or the conetnts of Search and Queue
 *
 * @param props: the jukebox area interactable that is being interacted with
 */
export function JukeBoxArea({
  jukeBoxArea,
}: {
  jukeBoxArea: JukeBoxAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const jukeBoxAreaController = useJukeBoxAreaController(jukeBoxArea.name);
  const [searchValue, setSearchValue] = useState('');
  const [spotifyAuthToken, setSpotifyAuthToken] = useState<string>('');
  // Current search results JSON Object
  const [searchResults, setSearchResults] = useState<SearchResultsType | undefined>();
  const toast = useToast();
  const { isOpen, onOpen } = useDisclosure();
  const [currentSong, setCurrentSong] = useState<Song | undefined>(undefined);
  const [queue, setQueue] = useState(jukeBoxAreaController.queue);
  const [playerVotes, setPlayerVotes] = useState<{
    [songId: string]: 'upvote' | null;
  }>({});

  // Function to update queue
  const updateQueue = (newQueue: Song[]) => {
    setQueue(newQueue);
    jukeBoxAreaController.queue = newQueue;
    townController.emitJukeBoxAreaUpdate(jukeBoxAreaController);
  };

  const handleSearchChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSearchValue(event.target.value);
  };
  const closeModal = useCallback(() => {
    townController.unPause();
  }, [townController]);

  const [, setSeconds] = useState<number>(0);
  useEffect(() => {
    if (isOpen && spotifyAuthToken === '') {
      const getTime = () => {
        const time = Date.now();
        setSeconds(Math.floor((time / 1000) % 60));
      };

      const interval = setInterval(() => getTime(), 1000);
      console.log('interval: ', interval);
      return () => clearInterval(interval);
    }
  }, [isOpen, spotifyAuthToken]);

  useEffect(() => {
    if (isOpen) {
      townController.pause();
    } else {
      townController.unPause();
    }
  }, [townController, isOpen]);
  useEffect(() => {
    const setQueueListener = (q: Song[] | undefined) => {
      if (!q) {
        townController.interactableEmitter.emit('endIteraction', jukeBoxAreaController);
      } else {
        setQueue(q);
      }
    };
    jukeBoxAreaController.addListener('jukeBoxQueueChange', setQueueListener);
    return () => {
      jukeBoxAreaController.removeListener('jukeBoxQueueChange', setQueueListener);
    };
  }, [jukeBoxAreaController, townController]);

  useEffect(() => {
    if (!currentSong) {
      setQueue(prevQueue => {
        if (prevQueue.length > 0) {
          setCurrentSong(prevQueue[0]);
          return prevQueue.slice(1);
        }
        return prevQueue;
      });
    }
  }, [currentSong, queue]);

  // set is open to true if it is false
  if (!isOpen) {
    onOpen();
  }

  const findSongs = async () => {
    if (searchValue) {
      const songs = await SpotifyController.search(spotifyAuthToken, searchValue, 'track');
      setSearchResults(songs);
    } else {
      setSearchResults(undefined);
    }
  };

  const upvoteSong = (songId: string) => {
    if (playerVotes[songId] === 'upvote') {
      const updatedPlayerVotes: { [songId: string]: 'upvote' | null } = {
        ...playerVotes,
        [songId]: null,
      };
      setPlayerVotes(updatedPlayerVotes);

      const updatedQueue = [...queue];
      updatedQueue.forEach((song, index) => {
        if (song.spotifyId === songId) {
          updatedQueue[index] = { ...song, upvotes: song.upvotes - 1 };
        }
      });
      updateQueue(updatedQueue);
    } else {
      const updatedPlayerVotes: { [songId: string]: 'upvote' | null } = {
        ...playerVotes,
        [songId]: 'upvote',
      };
      setPlayerVotes(updatedPlayerVotes);

      const updatedQueue = [...queue];
      updatedQueue.forEach((song, index) => {
        if (song.spotifyId === songId) {
          updatedQueue[index] = { ...song, upvotes: song.upvotes + 1 };
        }
      });
      updateQueue(updatedQueue);
    }
  };

  const addSongToQueue = (song: Song) => {
    const songInQueue = queue.some(queuedSong => queuedSong.spotifyId === song.spotifyId);

    if (songInQueue) {
      toast({
        title: 'That song is already in the queue',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } else {
      const updatedQueue = [...queue, song];
      updateQueue(updatedQueue);
      console.log('updated');
    }
  };

  const sortedQueue = queue.slice().sort((a, b) => b.upvotes - a.upvotes);

  useEffect(() => {
    // Cleanup function
    return () => {
      // Cancel any pending requests or subscriptions
      // to avoid updating the state of an unmounted component
      // Here we're cancelling the fetchData() request
      const source = axios.CancelToken.source();
      source.cancel('Component unmounted');
    };
  }, [searchValue]);

  let toRender;

  // Check if the user is logged in.
  if (spotifyAuthToken === '') {
    const authToken = window.localStorage.getItem('spotifyAuthToken');
    if (authToken !== null) {
      setSpotifyAuthToken(authToken);
    } else {
      toRender = (
        <Center marginTop={'20%'}>
          <JukeboxSpotifyLogin />
        </Center>
      );
    }
  } else {
    toRender = (
      <SearchAndQueue
        searchValue={searchValue}
        handleSearchChange={handleSearchChange}
        findSongs={findSongs}
        upvoteSong={upvoteSong}
        searchResults={searchResults}
        addSongToQueue={addSongToQueue}
        sortedQueue={sortedQueue}
        authToken={spotifyAuthToken}
        currentTrack={currentSong}
      />
    );
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          townController.interactEnd(jukeBoxArea);
        }}
        size={'full'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>JukeBox</ModalHeader>
          <ModalCloseButton />
          {toRender}
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

/**
 * The JukebBoxAreaAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a viewing area.
 */
export default function JukeBoxAreaWrapper(): JSX.Element {
  const jukeBoxArea = useInteractable<JukeBoxAreaInteractable>('jukeBoxArea');
  if (jukeBoxArea) {
    return <JukeBoxArea jukeBoxArea={jukeBoxArea} />;
  }
  return <></>;
}
