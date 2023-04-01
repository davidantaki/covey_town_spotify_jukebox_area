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
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { BsFillPlayFill } from 'react-icons/bs';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom';
import { useInteractable, useJukeBoxAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import SpotifyController from '../../../spotify/SpotifyController';
import JukeBoxAreaInteractable from './JukeBoxArea';

export class MockReactPlayer extends ReactPlayer {
  render(): React.ReactNode {
    return <></>;
  }
}

export function SearchResult({
  songTitle,
  songArtist,
  songDuration,
  songId,
}: {
  songTitle: string;
  songArtist: string;
  songDuration: string;
  songId: number;
}): JSX.Element {
  const playClickHandler = async () => {
    await SpotifyController.playTrack(
      'BQBxHsBC1f5rTv7qMf6EnfznDBuuervEELO-hJsvnR6qbe1Rb6GCB7mggyUekKRx3GZwENCfoecSOzvH5jr1KSfkGiadYWMscbwwxroYP1gxq4ev3LDty5y568qpdZrYg-wIaYRhmtl7fPkCcRA8Lns4_8ur5GfGJiEJuXxU5HGgZ9avWiJAR8M9OqI1ZCc',
      songId,
    );
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

  const findSongs = async () => {
    if (searchValue) {
      const songs = await SpotifyController.search(
        'BQBxHsBC1f5rTv7qMf6EnfznDBuuervEELO-hJsvnR6qbe1Rb6GCB7mggyUekKRx3GZwENCfoecSOzvH5jr1KSfkGiadYWMscbwwxroYP1gxq4ev3LDty5y568qpdZrYg-wIaYRhmtl7fPkCcRA8Lns4_8ur5GfGJiEJuXxU5HGgZ9avWiJAR8M9OqI1ZCc',
        searchValue,
        'track',
      );
      setSearchResults(songs);
      console.log(songs);
    } else {
      setSearchResults('');
    }
  };

  if (window.localStorage.getItem('spotifyAuthToken') === null) {
    // const authToken = window.localStorage.getItem('spotifyAuthToken');
    // if (authToken) {
    // setSpotifyAuthToken(JSON.parse(authToken));
    // } else {
    const url = SpotifyController.getAuthorizationLink();
    console.log(url);
    // Open in new window
    window.open(url, '_blank');
    // }
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
                    songId={item.id}
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
