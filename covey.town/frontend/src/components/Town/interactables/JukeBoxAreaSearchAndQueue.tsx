import {
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
import { encode as base64_encode } from 'base-64';
import React, { useCallback, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { useInteractable, useJukeBoxAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import JukeBoxAreaInteractable from './JukeBoxArea';

const ALLOWED_DRIFT = 3;
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
  const property = {
    imageUrl: 'https://bit.ly/2Z4KKcF',
    imageAlt: 'Rear view of modern home with pool',
    beds: 3,
    baths: 2,
    title: 'Modern home in city center in the heart of historic Los Angeles',
    formattedPrice: '$1,900.00',
    reviewCount: 34,
    rating: 4,
  };

  return (
    <Grid templateRows='repeat(1, 1fr)' templateColumns='repeat(3, 1fr)' gap={50} p='0'>
      <GridItem colSpan={1} h='10' bg='transparent'>
        {songTitle}
      </GridItem>
      <GridItem colSpan={1} h='10' bg='transparent'>
        {songArtist}
      </GridItem>
      <GridItem colSpan={1} h='10' bg='transparent'>
        {songDuration}
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
  // isOpenInit: boolean;
  // close: () => void;
  jukeBoxArea: JukeBoxAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const jukeBoxAreaController = useJukeBoxAreaController(jukeBoxArea.name);
  const [searchValue, setSearchValue] = React.useState('');
  // Current search results JSON Object
  const [searchResults, setSearchResults] = useState<any>();
  const handleSearchChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSearchValue(event.target.value);
    // SpotifyController.token('null');
    // SpotifyController.search(searchValue, SpotifyController.token()).then((res) => {
    setSearchResults(res);
    //   console.log(res);
    // }
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

  const [token, setToken] = useState<undefined | string>(undefined);

  // useEffect(() => {
  //   const hash = window.location.hash;
  //   let localToken = window.localStorage.getItem('token');

  //   if (!localToken && hash) {
  //     localToken = hash
  //       .substring(1)
  //       .split('&')
  //       .find(elem => elem.startsWith('access_token'))
  //       .split('=')[1];

  //     window.location.hash = '';
  //     window.localStorage.setItem('token', localToken);
  //   }

  //   setToken(localToken);
  // }, []);

  // const logout = () => {
  //   setToken('');
  //   window.localStorage.removeItem('token');
  // };

  // const spotifyLogin = useCallback(async () => {
  //   try {
  //     await SpotifyController.login();
  //     townController.unPause();
  //     closeModal();
  //   } catch (err) {
  //     if (err instanceof Error) {
  //       toast({
  //         title: 'Unable to create conversation',
  //         description: err.toString(),
  //         status: 'error',
  //       });
  //     } else {
  //       console.trace(err);
  //       toast({
  //         title: 'Unexpected Error',
  //         status: 'error',
  //       });
  //     }
  //   }
  // }, [closeModal, townController, toast]);

  // spotifyLogin();

  // const REACT_APP_TOWNS_SERVICE_URL = 'http://localhost:8081';
  const id = '1d5bdd45d42c4c92a2a935346a2fc3e2';
  const secret = '5c47a4ccaa1047ad8ca79e76a21d03f5';
  // const SPOTIFY_REDIRECT_URI = 'http://localhost:8888/callback';
  // const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
  // const SPOTIFY_RESPONSE_TYPE = 'token';

  useEffect(() => {
    async function fetchToken() {
      const getToken = async () => {
        try {
          const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + base64_encode(id + ':' + secret),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
          });
          const data = await response.json();
          const auth = data.access_token;
          console.log(auth);
          return auth;
        } catch (error) {
          console.log(error);
        }
      };
      const auth = await getToken();
      setToken(() => auth);
    }
    fetchToken();
  }, []);

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
            {/* <SearchResult songTitle='Song Title' songArtist='Song Artist' songDuration='3:00' />
      <SearchResult songTitle='Song Title' songArtist='Song Artist' songDuration='3:00' />
      <SearchResult songTitle='Song Title' songArtist='Song Artist' songDuration='3:00' /> */}
          </VStack>
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
