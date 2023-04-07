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
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import axios from 'axios';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom';
import { useInteractable, useJukeBoxAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import SpotifyController from '../../../spotify/SpotifyController';
import JukeBoxAreaInteractable from './JukeBoxArea';
import SpotifyPlayer from 'spotify-web-playback';

export interface Song {
  title: string;
  artists: string[];
  spotifyId: string;
  addedBy: string;
  upvotes: number;
  downvotes: number;
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
    downvotes,
    songJson: { ...songJson },
  };
}

export class MockReactPlayer extends ReactPlayer {
  render(): React.ReactNode {
    return <></>;
  }
}

export function SearchResult({
  songTitle,
  songArtist,
  songDuration,
  songUri,
  addSongToQueueFunc,
}: {
  songTitle: string;
  songArtist: string;
  songDuration: string;
  songUri: string;
  addSongToQueueFunc: (song: Song) => void;
}): JSX.Element {
  const playClickHandler = async () => {
    const token = localStorage.getItem('spotifyAuthToken');
    if (token) {
      await SpotifyController.playTrack(token, songUri);
    }
  };
  const addSongToQueueClickHandler = async () => {
    // Great a song object from this search result
    const song: Song = {
      title: songTitle,
      artists: [songArtist],
      spotifyId: songUri,
      addedBy: 'test',
      upvotes: 0,
      downvotes: 0,
      songJson: {},
    };
    addSongToQueueFunc(song);
  };

  return (
    <TableRow>
      <TableCell> {songTitle} </TableCell>
      <TableCell> {songArtist}</TableCell>
      <TableCell> {songDuration}</TableCell>
      {/* <TableCell>
        <Button onClick={playClickHandler}>
          <PlayArrowIcon />
        </Button>
      </TableCell> */}
      <TableCell>
        <Button onClick={addSongToQueueClickHandler}>
          <QueueMusicIcon />
        </Button>
      </TableCell>
    </TableRow>
  );
}

/**
 * Component that handles the login to spotify and saving the token to local storage
 * if the user is not logged in to spotify.
 */
export function JukeboxSpotifyLogin(): JSX.Element {
  useEffect(() => {
    // Cleanup function
    return () => {
      // Cancel any pending requests or subscriptions
      // to avoid updating the state of an unmounted component
      // Here we're cancelling the fetchData() request
      const source = axios.CancelToken.source();
      source.cancel('Component unmounted');
    };
  }, []);

  const clickHandler = () => {
    const url = SpotifyController.getAuthorizationLink();
    window.open(url, '_blank');
  };

  return (
    <Button colorScheme='teal' variant='solid' onClick={clickHandler}>
      Login To Spotify
    </Button>
  );
}

/**
 * Component that handles the saving of the spotify token to local storage
 * after the user has logged in to spotify. This component is used to get the
 * token from the url and save it to local storage. This component is used
 * in the spotify login popup window.
 */
export function JukeboxSpotifySaveAuthToken(): JSX.Element {
  const params: any = useParams();
  const token = params.authToken;
  window.localStorage.setItem('spotifyAuthToken', token);
  // remove id & token from route params after saving to local storage
  window.history.replaceState(null, '', `${window.location.origin}/user-token`);
  window.close();
  return <></>;
}

export function QueueItem({
  song,
  onUpvote,
  onDownvote,
}: {
  song: Song;
  onUpvote: () => void;
  onDownvote: () => void;
}): JSX.Element {
  return (
    <TableRow>
      <TableCell> {song.title} </TableCell>
      <TableCell> {song.artists}</TableCell>
      <TableCell>
        <Button onClick={onUpvote}>
          <ExpandLessIcon />
        </Button>
      </TableCell>
      <TableCell>
        <Button onClick={onDownvote}>
          <ExpandMoreIcon />
        </Button>
      </TableCell>
      <TableCell> {song.upvotes - song.downvotes} </TableCell>
    </TableRow>
  );
}

/**
 * Used while getting the spotify token to update our main component
 * so that it continues to retrieve the token from local storage to check
 * if it is valid.
 */
export function UpateComponentTimerWhileGettingSpotifyToken(): JSX.Element {
  const [timeSeconds, setSeconds] = useState<number>(0);
  const getTime = () => {
    const time = Date.now();
    setSeconds(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    const interval = setInterval(() => getTime(), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <p>The current time is: {timeSeconds}</p>
    </>
  );
}

export function SpotifyWebPlayback({
  token,
  currentTrack,
}: {
  token: string;
  currentTrack: Song;
}): JSX.Element {
  const [isConnected, setConnected] = useState<boolean>(false);
  const [isActive, setActive] = useState<boolean>(false);
  // const [currentTrack, setTrack] = useState<Song>(track);

  const spotifyPlayer = useMemo(() => {
    return new SpotifyPlayer('Covey.Town Spotify Player');
  }, []);
  const uri = 'spotify:track:54flyrjcdnQdco7300avMJ';
  async function connectToSpotifyPlayer(authToken: string) {
    try {
      const response = await spotifyPlayer.connect(authToken);
      // Check that we connected
      if (response === true) {
        console.log('Connected to Spotify Player');
        setConnected(true);
      } else {
        console.log('Failed to connect to Spotify Player');
        setConnected(false);
      }
    } catch (e) {
      console.log(e);
    }
  }

  // Play new track if updated
  useEffect(() => {
    if (isConnected && currentTrack) {
      spotifyPlayer.play(currentTrack.spotifyId);
    }
  }, [currentTrack, isConnected, spotifyPlayer]);

  if (!isConnected) {
    connectToSpotifyPlayer(token);
  }

  if (!isConnected) {
    return (
      <>
        <Center fontSize='2xl' justifyContent={'center'} marginBottom={'4px'}>
          Spotify Player Failed to Connect. Try reloading the page.
        </Center>
      </>
    );
  } else if (currentTrack) {
    return (
      <>
        <Center fontSize='2xl' justifyContent={'center'} marginBottom={'4px'}>
          {/* {currentTrack.name} */}
          Connected
        </Center>
        <VStack>
          <TableContainer style={{ paddingRight: '2%' }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell> {currentTrack.title} </TableCell>
                  <TableCell> {currentTrack.artists} </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </VStack>
      </>
    );
  } else {
    return (
      <>
        <Center fontSize='2xl' justifyContent={'center'} marginBottom={'4px'}>
          No Track Playing
        </Center>
      </>
    );
  }
}

export function SearchAndQueue({
  searchValue,
  handleSearchChange,
  findSongs,
  upvoteSong,
  downvoteSong,
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
  downvoteSong: (songId: string) => void;
  searchResults: any;
  addSongToQueue: (song: Song) => void;
  sortedQueue: Song[];
  authToken: string;
  currentTrack: Song;
}): JSX.Element {
  return (
    <>
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
              Here!
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
                  {/* <TableCell style={{ fontWeight: 'bolder' }}>Play</TableCell> */}
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
                      <TableRow key={item.id}>
                        <TableCell> {item.name} </TableCell>
                        <TableCell> {item.artists[0].name}</TableCell>
                        <TableCell> {item.duration_ms}</TableCell>
                      </TableRow>
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
        <Center fontSize='2xl' justifyContent={'center'} marginBottom={'4px'}>
          Queue
        </Center>
        <VStack>
          <TableContainer style={{ paddingRight: '2%' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bolder' }}>Title</TableCell>
                  <TableCell style={{ fontWeight: 'bolder' }}>Artist</TableCell>
                  <TableCell style={{ fontWeight: 'bolder' }}>Upvote</TableCell>
                  <TableCell style={{ fontWeight: 'bolder' }}>Downvote</TableCell>
                  <TableCell style={{ fontWeight: 'bolder' }}>Net Votes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedQueue.map((song: Song) => {
                  return (
                    <QueueItem
                      key={song.spotifyId}
                      song={song}
                      onUpvote={() => upvoteSong(song.spotifyId)}
                      onDownvote={() => downvoteSong(song.spotifyId)}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </VStack>
      </GridItem>
    </>
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
  const [queue, setQueue] = useState(jukeBoxAreaController.queue);

  const [playerVotes, setPlayerVotes] = useState<{
    [songId: string]: 'upvote' | 'downvote' | null;
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
      toast({
        title: 'You can only upvote each song once.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } else if (playerVotes[songId] === 'downvote') {
      const updatedPlayerVotes: { [songId: string]: 'upvote' | 'downvote' | null } = {
        ...playerVotes,
        [songId]: 'upvote',
      };
      setPlayerVotes(updatedPlayerVotes);

      const updatedQueue = [...queue];
      updatedQueue.forEach((song, index) => {
        if (song.spotifyId === songId) {
          updatedQueue[index] = {
            ...song,
            upvotes: song.upvotes + 1,
            downvotes: song.downvotes - 1,
          };
        }
      });
      updateQueue(updatedQueue);
    } else {
      const updatedPlayerVotes: { [songId: string]: 'upvote' | 'downvote' | null } = {
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

  const downvoteSong = (songId: string) => {
    if (playerVotes[songId] === 'downvote') {
      toast({
        title: 'You can only downvote each song once.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } else if (playerVotes[songId] === 'upvote') {
      const updatedPlayerVotes: { [songId: string]: 'upvote' | 'downvote' | null } = {
        ...playerVotes,
        [songId]: 'downvote',
      };
      setPlayerVotes(updatedPlayerVotes);

      const updatedQueue = [...queue];
      updatedQueue.forEach((song, index) => {
        if (song.spotifyId === songId) {
          updatedQueue[index] = {
            ...song,
            downvotes: song.downvotes + 1,
            upvotes: song.upvotes - 1,
          };
        }
      });
      updateQueue(updatedQueue);
    } else {
      const updatedPlayerVotes: { [songId: string]: 'upvote' | 'downvote' | null } = {
        ...playerVotes,
        [songId]: 'downvote',
      };
      setPlayerVotes(updatedPlayerVotes);

      const updatedQueue = [...queue];
      updatedQueue.forEach((song, index) => {
        if (song.spotifyId === songId) {
          updatedQueue[index] = { ...song, downvotes: song.downvotes + 1 };
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
    }
  };

  const netVotes = (song: Song) => song.upvotes - song.downvotes;

  const sortedQueue = queue.slice().sort((a, b) => netVotes(b) - netVotes(a));

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
        <>
          <GridItem>
            <JukeboxSpotifyLogin />
          </GridItem>
        </>
      );
    }
  } else {
    toRender = (
      <SearchAndQueue
        searchValue={searchValue}
        handleSearchChange={handleSearchChange}
        findSongs={findSongs}
        upvoteSong={upvoteSong}
        downvoteSong={downvoteSong}
        searchResults={searchResults}
        addSongToQueue={addSongToQueue}
        sortedQueue={sortedQueue}
        authToken={spotifyAuthToken}
        currentTrack={sortedQueue[0]}
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
          <Grid templateColumns='repeat(51, 1fr)'>{toRender}</Grid>
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
