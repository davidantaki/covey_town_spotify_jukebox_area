import {
  Button,
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
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { BsFillPlayFill } from 'react-icons/bs';
import ReactPlayer from 'react-player';
import { useInteractable, useJukeBoxAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import SpotifyController from '../../../spotify/SpotifyController';
import JukeBoxAreaInteractable from './JukeBoxArea';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';

export class MockReactPlayer extends ReactPlayer {
  render(): React.ReactNode {
    return <></>;
  }
}

export function SearchResult({
  songTitle,
  songArtist,
  songDuration,
}: {
  songTitle: string;
  songArtist: string;
  songDuration: string;
}): JSX.Element {
  const playClickHandler = () => {
    SpotifyController.playTrack(songTitle, songArtist);
  };
  return (
    <Grid templateRows='repeat(1, 1fr)' templateColumns='repeat(10, 1fr)' gap='50px' p='0'>
      <GridItem w='100%' colSpan={5} h='10' bg='transparent'>
        {songTitle}
      </GridItem>
      <GridItem w='100%' colSpan={2} h='10' bg='transparent'>
        {songArtist}
      </GridItem>
      <GridItem w='100%' colSpan={1} h='10' bg='transparent'>
        {songDuration}
      </GridItem>
      <GridItem w='100%' colSpan={1} h='10' bg='transparent'>
        <Tooltip label='Play Song' fontSize='md'>
          <Button colorScheme='teal' variant='solid' onClick={playClickHandler}>
            <Icon as={BsFillPlayFill} />
          </Button>
        </Tooltip>
      </GridItem>
    </Grid>
  );
}

export function JukeboxSpotifyLogin(): JSX.Element {
  useEffect(() => {
    const url = SpotifyController.getAuthorizationLink();
    console.log(url);
    // Open in new window
    window.open(url, '_blank');
    // Cleanup function
    return () => {
      // Cancel any pending requests or subscriptions
      // to avoid updating the state of an unmounted component
      // Here we're cancelling the fetchData() request
      const source = axios.CancelToken.source();
      source.cancel('Component unmounted');
    };
  }, []);
  return <></>;
}

export function JukeboxSpotifySaveAuthToken(): JSX.Element {
  const params: any = useParams();
  const token = params.authToken;
  window.localStorage.setItem('spotifyAuthToken', JSON.stringify(token));
  // remove id & token from route params after saving to local storage
  window.history.replaceState(null, '', `${window.location.origin}/user-token`);
  window.close();
  return <></>;
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
  const [spotifyAuthToken, setSpotifyAuthToken] = useState<string>('');
  const [searchValue, setSearchValue] = React.useState('');
  // Current search results JSON Object
  const [searchResults, setSearchResults] = useState<any>();
  const handleSearchChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSearchValue(event.target.value);
  };

  const closeModal = useCallback(() => {
    townController.unPause();
  }, [townController]);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [queue, setQueue] = useState(jukeBoxAreaController.queue);

  useEffect(() => {
    if (isOpen) {
      townController.pause();
    } else {
      townController.unPause();
    }
  }, [townController, isOpen]);
  useEffect(() => {
    const setQeueue = (q: string[] | undefined) => {
      if (!q) {
        townController.interactableEmitter.emit('endIteraction', jukeBoxAreaController);
      } else {
        setQueue(q);
      }
    };
    // jukeBoxAreaController.addListener('jukeBoxQueueChange', setQueue);
    // return () => {
    //   jukeBoxAreaController.removeListener('jukeBoxQueueChange', setQueue);
    // };
  }, [jukeBoxAreaController, townController]);

  // set is open to true if it is false
  if (!isOpen) {
    onOpen();
  }

  const [token, setToken] = useState<string>('');

  useEffect(() => {
    async function findSongs() {
      // only search if there is a search value
      if (searchValue !== '') {
        const songs = await SpotifyController.search(token, searchValue, 'track');
        setSearchResults(songs);
        console.log(songs);
      } else {
        setSearchResults(undefined);
      }
    }
    findSongs();
    // Cleanup function
    return () => {
      // Cancel any pending requests or subscriptions
      // to avoid updating the state of an unmounted component
      // Here we're cancelling the fetchData() request
      const source = axios.CancelToken.source();
      source.cancel('Component unmounted');
    };
  }, [searchValue, token]);

  if (spotifyAuthToken === '') {
    const authToken = window.localStorage.getItem('spotifyAuthToken');
    if (authToken) {
      setSpotifyAuthToken(JSON.parse(authToken));
    } else {
      return <JukeboxSpotifyLogin />;
    }
  } else {
    return (
      <>
        {/* <BrowserRouter> */}
        {/* <Switch>
          <Route exact path='/' component={JukeboxSpotifyLogin} />
          <Route
            path='/jukebox-spotify-login/user-token/:authToken'
            component={JukeboxSpotifyProfile}
          />
          <Redirect to='/' />
        </Switch> */}
        {/* </BrowserRouter> */}
        {/* <Redirect to='/jukebox-spotify-login' /> */}
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
            <InputGroup>
              <Input
                pr='4.5rem'
                type='tel'
                value={searchValue}
                onChange={handleSearchChange}
                placeholder='Search Songs'
              />
            </InputGroup>
            <VStack>
              {/* Map search results response to SearchResults */}
              {searchResults &&
                searchResults.tracks &&
                searchResults.tracks.items &&
                searchResults.tracks.items.map((item: any) => {
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <SearchResult
                      songTitle={item.name}
                      songArtist={item.artists[0].name}
                      songDuration={item.duration_ms}
                    />
                  );
                })}
            </VStack>
            <ModalFooter></ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }
  return <></>;
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
