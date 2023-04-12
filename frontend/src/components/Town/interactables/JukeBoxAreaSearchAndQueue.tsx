/// <reference types='@types/spotify-web-playback-sdk' />;
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  Input,
  InputGroup,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { useInteractable, useJukeBoxAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import SpotifyController from '../../../spotify/SpotifyController';
import { JukeboxSpotifyLogin } from '../Login';
import { QueueItem } from '../QueueItem';
import { SearchResult } from '../SearchResult';
import { SpotifyWebPlayback } from '../WebPlaybackSDK';
import JukeBoxAreaInteractable from './JukeBoxArea';

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

  return {
    title,
    artists,
    spotifyId,
    addedBy,
    upvotes,
    songJson: { ...songJson },
  };
}

export class MockReactPlayer extends ReactPlayer {
  render(): React.ReactNode {
    return <></>;
  }
}

// /**
//  * Used while getting the spotify token to update our main component
//  * so that it continues to retrieve the token from local storage to check
//  * if it is valid.
//  */
// export function UpateComponentTimerWhileGettingSpotifyToken(): JSX.Element {
//   const [timeSeconds, setSeconds] = useState<number>(0);
//   const getTime = () => {
//     const time = Date.now();
//     setSeconds(Math.floor((time / 1000) % 60));
//   };
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
  searchResults: {
    tracks: {
      items: {
        id: string;
        name: string;
        artists: { name: string }[];
        duration: string;
        uri: string;
      }[];
    };
  };
  addSongToQueue: (song: Song) => void;
  sortedQueue: Song[];
  authToken: string;
  currentTrack: Song | undefined;
}): JSX.Element {
  return (
    <Grid templateColumns='repeat(51, 1fr)' templateRows='repeat(1fr, 2)'>
      <GridItem colSpan={25}>
        <Flex gap={'5px'}>
          <Box width={'85%'} marginLeft={'2%'}>
            <InputGroup>
              <Input
                pr='4.5rem'
                type='tel'
                value={searchValue}
                onChange={handleSearchChange}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    findSongs();
                  }
                }}
                placeholder='Search Songs'
              />
            </InputGroup>
          </Box>
          <Box width={'15%'} marginRight={'2%'}>
            <Button width={'100%'} onClick={findSongs}>
              Search!
            </Button>
          </Box>
        </Flex>
        <VStack>
          <TableContainer style={{ paddingLeft: '2%' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bolder' }}>Title</TableCell>
                  <TableCell style={{ fontWeight: 'bolder' }}>Artist</TableCell>
                  <TableCell style={{ fontWeight: 'bolder' }}>Duration</TableCell>
                  <TableCell style={{ fontWeight: 'bolder' }}>+ Queue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Map search results response to SearchResults */}
                {searchResults &&
                  searchResults.tracks &&
                  searchResults.tracks.items &&
                  searchResults.tracks.items.map((item: any) => {
                    return (
                      <SearchResult
                        key={item.id}
                        songTitle={item.name}
                        songArtist={item.artists[0].name}
                        songDuration={item.duration_ms}
                        songUri={item.uri}
                        addSongToQueueFunc={addSongToQueue}
                      />
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </VStack>
      </GridItem>
      <GridItem colSpan={1} bg={'black'} width={'10%'} justifySelf='center'></GridItem>
      <GridItem colSpan={25}>
        <SpotifyWebPlayback token={authToken} currentTrack={currentTrack} />
        <VStack>
          <TableContainer style={{ paddingRight: '2%' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bolder' }}>Title</TableCell>
                  <TableCell style={{ fontWeight: 'bolder' }}>Artist</TableCell>
                  <TableCell style={{ fontWeight: 'bolder' }}>Vote</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedQueue.map((song: Song) => {
                  return (
                    <QueueItem
                      key={song.spotifyId}
                      song={song}
                      onUpvote={() => upvoteSong(song.spotifyId)}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </VStack>
      </GridItem>
    </Grid>
  );
}

/**
 * The ViewingArea monitors the player's interaction with a ViewingArea on the map: displaying either
 * a popup to set the video for a viewing area, or if the video is set, a video player.
 *
 * @param props: the viewing area interactable that is being interacted with
 */
export function JukeBoxArea({
  jukeBoxArea,
}: {
  jukeBoxArea: JukeBoxAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const jukeBoxAreaController = useJukeBoxAreaController(jukeBoxArea.name);
  const [searchValue, setSearchValue] = React.useState('');
  const [spotifyAuthToken, setSpotifyAuthToken] = useState<string>('');
  // Current search results JSON Object
  const [searchResults, setSearchResults] = useState<any>();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      setSearchResults('');
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
        currentSong={currentSong}
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
 * The ViewingAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a viewing area.
 */
export default function JukeBoxAreaWrapper(): JSX.Element {
  const jukeBoxArea = useInteractable<JukeBoxAreaInteractable>('jukeBoxArea');
  if (jukeBoxArea) {
    return <JukeBoxArea jukeBoxArea={jukeBoxArea} />;
  }
  return <></>;
}
