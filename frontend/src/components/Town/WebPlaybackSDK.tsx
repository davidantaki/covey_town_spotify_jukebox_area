import React, { useEffect, useState, useMemo } from 'react';
import SpotifyPlayer from 'spotify-web-playback';
import { Center, VStack } from '@chakra-ui/react';
import { Table, TableBody, TableCell, TableContainer, TableRow } from '@material-ui/core';
import { Song } from './interactables/JukeBoxAreaSearchAndQueue';

export function SpotifyWebPlayback({
  token,
  currentTrack,
}: {
  token: string;
  currentTrack: Song;
}): JSX.Element {
  const [isConnected, setConnected] = useState<boolean>(false);

  const spotifyPlayer = useMemo(() => {
    return new SpotifyPlayer('Covey.Town Spotify Player');
  }, []);

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
