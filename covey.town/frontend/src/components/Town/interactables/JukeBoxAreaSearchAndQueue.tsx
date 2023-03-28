import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  Container,
  Stack,
  Text,
  InputGroup,
  InputRightElement,
  IconButton,
  InputLeftElement,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useInteractable, useJukeBoxAreaController } from '../../../classes/TownController';
import JukeBoxAreaController from '../../../classes/JukeBoxAreaController';
import useTownController from '../../../hooks/useTownController';
import JukeBoxAreaInteractable from './JukeBoxArea';

const ALLOWED_DRIFT = 3;
export class MockReactPlayer extends ReactPlayer {
  render(): React.ReactNode {
    return <></>;
  }
}

/*
export function JukeBoxAreaSearchAndQueue({
  controller,
}: {
  controller: JukeBoxAreaController;
}): JSX.Element {
  // const [isPlaying, setPlaying] = useState<boolean>(controller.isPlaying);
  const townController = useTownController();

  const reactPlayerRef = useRef<ReactPlayer>(null);

  // useEffect(() => {
  //   const progressListener = (newTime: number) => {
  //     const currentTime = reactPlayerRef.current?.getCurrentTime();
  //     if (currentTime !== undefined && Math.abs(currentTime - newTime) > ALLOWED_DRIFT) {
  //       reactPlayerRef.current?.seekTo(newTime, 'seconds');
  //     }
  //   };
  //   controller.addListener('progressChange', progressListener);
  //   controller.addListener('playbackChange', setPlaying);
  //   return () => {
  //     controller.removeListener('playbackChange', setPlaying);
  //     controller.removeListener('progressChange', progressListener);
  //   };
  // }, [controller]);

  return (
    <Container className='participant-wrapper'>
      Viewing Area: {controller.id}
      <ReactPlayer
        // url={controller.video}
        ref={reactPlayerRef}
        config={{
          youtube: {
            playerVars: {
              // disable skipping time via keyboard to avoid weirdness with chat, etc
              disablekb: 1,
              autoplay: 1,
              // modestbranding: 1,
            },
          },
        }}
        // playing={isPlaying}
        // onProgress={state => {
        //   if (state.playedSeconds != 0 && state.playedSeconds != controller.elapsedTimeSec) {
        //     controller.elapsedTimeSec = state.playedSeconds;
        //     townController.emitViewingAreaUpdate(controller);
        //   }
        // }}
        // onPlay={() => {
        //   if (!controller.isPlaying) {
        //     controller.isPlaying = true;
        //     townController.emitViewingAreaUpdate(controller);
        //   }
        // }}
        // onPause={() => {
        //   if (controller.isPlaying) {
        //     controller.isPlaying = false;
        //     townController.emitViewingAreaUpdate(controller);
        //   }
        // }}
        // onEnded={() => {
        //   if (controller.isPlaying) {
        //     controller.isPlaying = false;
        //     townController.emitViewingAreaUpdate(controller);
        //   }
        // }}
        // controls={true}
        // width='100%'
        // height='100%'
      />
    </Container>
  );
}
*/

/**
 * The ViewingArea monitors the player's interaction with a ViewingArea on the map: displaying either
 * a popup to set the video for a viewing area, or if the video is set, a video player.
 *
 * @param props: the viewing area interactable that is being interacted with
 */
export function JukeBoxArea({
  jukeBoxArea,
}: {
  // isOpen: boolean;
  // close: () => void;
  jukeBoxArea: JukeBoxAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const jukeBoxAreaController = useJukeBoxAreaController(jukeBoxArea.name);

  const closeModal = useCallback(() => {
    townController.unPause();
    close();
  }, [townController, close]);

  const toast = useToast();

  const [selectIsOpen, setSelectIsOpen] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [queue, setQueue] = useState(jukeBoxAreaController.queue);
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

  console.log('here');

  // return (
  //   <Stack spacing={3}>
  //     <Input placeholder='extra small size' size='xs' />
  //     <Input placeholder='small size' size='sm' />
  //     <Input placeholder='medium size' size='md' />
  //     <Input placeholder='large size' size='lg' />
  //   </Stack>
  // );

  // Log state of isOpen
  console.log('isOpen', isOpen);

  // set is open to true if it is false
  if (!isOpen) {
    onOpen();
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant='ghost'>Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );

  // return (
  //   <Modal
  //     isOpen={selectIsOpen}
  //     onClose={() => {
  //       closeModal();
  //       townController.interactEnd(jukeBoxArea);
  //     }}>
  //     <ModalOverlay />
  //     <ModalContent>
  //       <ModalHeader>Pick a video to watch i </ModalHeader>
  //     </ModalContent>
  //   </Modal>
  // );
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
