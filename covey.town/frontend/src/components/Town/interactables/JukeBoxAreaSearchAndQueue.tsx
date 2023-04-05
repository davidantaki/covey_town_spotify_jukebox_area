/// <reference types='@types/spotify-web-playback-sdk' />;
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Icon,
  Input,
  InputGroup,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tooltip,
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
import { BsFillPlayFill, BsPlusCircleFill } from 'react-icons/bs';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom';
import { useInteractable, useJukeBoxAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import SpotifyController from '../../../spotify/SpotifyController';
// import { Song, createSong } from '../../../types/CoveyTownSocket';
// import { ViewingArea as ViewingAreaModel } from '../../../types/CoveyTownSocket';
import JukeBoxAreaInteractable from './JukeBoxArea';

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
    <Grid
      templateRows='repeat(1, 1fr)'
      templateColumns='repeat(10, 1fr)'
      gap='50px'
      p='0'
      mt={'3%'}>
      <GridItem w='100%' colSpan={5} h='10' bg='transparent' mt={'2%'} ml={'8%'}>
        {songTitle}
      </GridItem>
      <GridItem w='100%' colSpan={2} h='10' bg='transparent' mt={'2%'} ml={'8%'}>
        {songArtist}
      </GridItem>
      <GridItem w='100%' colSpan={1} h='10' mt={'2%'} ml={'8%'}>
        {songDuration}
      </GridItem>
      <GridItem w='100%' colSpan={1} h='10' bg='transparent' mt={'2%'} ml={'8%'}>
        <Tooltip label='Play Song' fontSize='md'>
          <Button colorScheme='teal' variant='solid' onClick={playClickHandler}>
            <Icon as={BsFillPlayFill} />
          </Button>
        </Tooltip>
      </GridItem>
      <GridItem w='100%' colSpan={1} h='10' bg='transparent' mt={'2%'} ml={'8%'}>
        <Tooltip label='Add To Queue' fontSize='md'>
          <Button colorScheme='teal' variant='solid' onClick={addSongToQueueClickHandler}>
            <Icon as={BsPlusCircleFill} />
          </Button>
        </Tooltip>
      </GridItem>
    </Grid>
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
    <Grid
      templateRows='repeat(1, 1fr)'
      templateColumns='repeat(10, 1fr)'
      gap='50px'
      p='0'
      mt={'3%'}>
      <GridItem w='100%' colSpan={4} h='10' bg='transparent' mt={'2%'} ml={'8%'}>
        {song.title}
      </GridItem>
      <GridItem w='100%' colSpan={3} h='10' bg='transparent' mt={'2%'} ml={'8%'}>
        {song.artists.join(', ')}
      </GridItem>
      <GridItem w='100%' colSpan={1} h='10' bg='transparent' mt={'2%'} ml={'8%'}>
        <Button colorScheme='green' variant='solid' onClick={onUpvote}>
          Upvote
        </Button>
      </GridItem>
      <GridItem w='100%' colSpan={1} h='10' bg='transparent' mt={'2%'} ml={'8%'}>
        <Button colorScheme='red' variant='solid' onClick={onDownvote}>
          Downvote
        </Button>
      </GridItem>
      <GridItem w='100%' colSpan={1} h='10' bg='transparent' mt={'2%'} ml={'8%'}>
        {song.upvotes - song.downvotes}
      </GridItem>
    </Grid>
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

interface Image {
  url: string;
}

interface Album {
  images: Image[];
}

interface Artist {
  name: string;
}

interface Track {
  name: string;
  album: Album;
  artists: Artist[];
}

const track = {
  name: '',
  _album: {
    images: [{ url: '' }],
  },
  get album() {
    return this._album;
  },
  set album(value) {
    this._album = value;
  },
  artists: [{ name: '' }],
};

export function SpotifyWebPlayback({ token }: { token: string }): JSX.Element {
  const [isPaused, setPaused] = useState<boolean>(false);
  const [isActive, setActive] = useState<boolean>(false);
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const [currentTrack, setTrack] = useState<Track>(track);
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const tempPlayer = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: cb => {
          cb(token);
        },
        volume: 0.5,
      });

      setPlayer(tempPlayer);

      tempPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
      });

      tempPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
      });

      tempPlayer.addListener('initialization_error', ({ message }) => {
        console.log('initialization_error');
        console.error(message);
      });

      tempPlayer.addListener('authentication_error', ({ message }) => {
        console.log('authentication_error');
        console.error(message);
      });

      tempPlayer.addListener('account_error', ({ message }) => {
        console.log('account_error');
        console.error(message);
      });

      tempPlayer.addListener('player_state_changed', (state: Spotify.PlaybackState) => {
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        tempPlayer.getCurrentState().then(tempState => {
          const isAct = !tempState ? false : true;
          setActive(isAct);
        });
      });

      tempPlayer.connect().then((connected: boolean) => {
        if (connected) {
          console.log('player.connect() success');
        } else {
          console.log('player.connect() FAILED');
        }
      });
    };
  }, [token]);

  if (!isActive) {
    return (
      <>
        <div className='container'>
          <div className='main-wrapper'>
            <b> Instance not active. Transfer your playback using your Spotify app </b>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className='container'>
          <div className='main-wrapper'>
            <img src={currentTrack.album.images[0].url} className='now-playing__cover' alt='' />

            <div className='now-playing__side'>
              <div className='now-playing__name'>{currentTrack.name}</div>
              <div className='now-playing__artist'>{currentTrack.artists[0].name}</div>

              <button
                className='btn-spotify'
                onClick={() => {
                  player?.previousTrack();
                }}>
                &lt;&lt;
              </button>

              <button
                className='btn-spotify'
                onClick={() => {
                  player?.togglePlay();
                }}>
                {isPaused ? 'PLAY' : 'PAUSE'}
              </button>

              <button
                className='btn-spotify'
                onClick={() => {
                  player?.nextTrack();
                }}>
                &gt;&gt;
              </button>
            </div>
          </div>
        </div>
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
}): JSX.Element {
  return (
    <>
      <GridItem>
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
          <TableContainer style={{ marginTop: '10px', paddingLeft: '2%', paddingRight: '2%' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bolder' }}>Title</TableCell>
                  <TableCell style={{ fontWeight: 'bolder' }}>Artist</TableCell>
                  <TableCell style={{ fontWeight: 'bolder' }}>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Map search results response to SearchResults */}
                {searchResults &&
                  searchResults.tracks &&
                  searchResults.tracks.items &&
                  searchResults.tracks.items.map((item: any) => {
                    return (
                      <TableRow
                        key={item.id}
                        onClick={async () => {
                          if (authToken) {
                            await SpotifyController.playTrack(authToken, item.uri);
                          }
                        }}>
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
      {/* The queue */}
      <GridItem>
        <SpotifyWebPlayback token={authToken} />
        <VStack>
          {sortedQueue.map((song: Song) => (
            <QueueItem
              key={song.spotifyId}
              song={song}
              onUpvote={() => upvoteSong(song.spotifyId)}
              onDownvote={() => downvoteSong(song.spotifyId)}
            />
          ))}
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
          <Grid templateColumns='repeat(2, 1fr)' gap={6}>
            {toRender}
          </Grid>
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
