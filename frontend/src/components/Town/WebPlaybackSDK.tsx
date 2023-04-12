import { Center, VStack } from '@chakra-ui/react';
import { Table, TableBody, TableCell, TableContainer, TableRow } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import SpotifyPlayer from 'spotify-web-playback';
import { Song } from '../../classes/JukeBoxAreaController';

/**
 * SpotifyWebPlayback is a visual component that does the heavylifting with respect to
 * web SDK playing. It will create an SDK instance and connect the spotify account to it
 * based on the authorization token.
 * @param props is the set of properties: token, currentTrack, where token represents the authorization
 * token needed to make requests from Spotify API and currentTrack is the song to play.
 */
export function SpotifyWebPlayback({
  token,
  currentTrack,
}: {
  token: string;
  currentTrack: Song | undefined;
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
