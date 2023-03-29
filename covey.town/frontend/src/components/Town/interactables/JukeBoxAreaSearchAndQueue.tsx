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
import React, { useCallback, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
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
}: {
  songTitle: string;
  songArtist: string;
  songDuration: string;
}): JSX.Element {
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
  jukeBoxArea: JukeBoxAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const jukeBoxAreaController = useJukeBoxAreaController(jukeBoxArea.name);
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
    async function getToken() {
      const auth = await SpotifyController.fetchToken();
      setToken(() => auth);
    }
    getToken();
  }, []);

  useEffect(() => {
    async function findSongs() {
      const songs = await SpotifyController.search(token, searchValue, 'track');
      console.log(songs);
    }
    findSongs();
  }, [searchValue, token]);

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
