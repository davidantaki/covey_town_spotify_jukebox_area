import { Button } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SpotifyController from '../../spotify/SpotifyController';

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
    <Button colorScheme='teal' variant='solid' onClick={clickHandler} size='lg'>
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
  const params: { authToken: string } = useParams();
  const token = params.authToken;
  window.localStorage.setItem('spotifyAuthToken', token);
  // remove id & token from route params after saving to local storage
  window.history.replaceState(null, '', `${window.location.origin}/user-token`);
  window.close();
  return <></>;
}
