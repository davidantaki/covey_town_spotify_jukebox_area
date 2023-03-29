import { decode as base64_decode, encode as base64_encode } from 'base-64';

/**
 * This is an example of a basic node.js script that performs
 * the Client Credentials oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
 */

const REACT_APP_TOWNS_SERVICE_URL = 'http://localhost:8081';
const SPOTIFY_CLIENT_ID = '1d5bdd45d42c4c92a2a935346a2fc3e2';
const SPOTIFY_CLIENT_SECRET = '5c47a4ccaa1047ad8ca79e76a21d03f5';
const SPOTIFY_REDIRECT_URI = 'http://localhost:8888/callback';
const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_RESPONSE_TYPE = 'token';

let token = '';

export function getSpotifyToken() {
  // Make a post request to the Spotify Accounts using fetch()
  fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + base64_encode(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
    .then(response => response.json())
    .then(data => {
      // use the access token to access the Spotify Web API
      token = data.access_token;
      console.log(token);
    })
    .catch(error => {
      console.log(error);
    });
}
