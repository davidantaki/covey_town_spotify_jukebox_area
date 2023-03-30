import { encode as base64_encode } from 'base-64';
import QueryString from 'qs';

// const REACT_APP_TOWNS_SERVICE_URL = 'http://localhost:8081';
// const SPOTIFY_CLIENT_ID = '1d5bdd45d42c4c92a2a935346a2fc3e2';
// const SPOTIFY_CLIENT_SECRET = '5c47a4ccaa1047ad8ca79e76a21d03f5';
// const SPOTIFY_REDIRECT_URI = 'http://localhost:8888/callback';
// const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
// const SPOTIFY_RESPONSE_TYPE = 'token';

const ID = '1d5bdd45d42c4c92a2a935346a2fc3e2';
const SECRET = '5c47a4ccaa1047ad8ca79e76a21d03f5';

/**
 * Abstraction layer in code to communicate with Spotify API to receive authenication,
 * track information, and more.
 */
export default class SpotifyController {
  /**
   * This is an example of a basic node.js script that performs
   * the Client Credentials oAuth2 flow to authenticate against
   * the Spotify Accounts.
   *
   * For more information, read
   * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
   */

  public static async fetchToken(): Promise<string> {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + base64_encode(ID + ':' + SECRET),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      return '';
    }
  }

  /**
   * This method uses Spotify API to get track information for a given track that is identified
   * by a unique trackId. In order to ensure security, an auth token is used for authentication.
   * @param authToken is the authorizatization token needed for Spotify API to give info.
   * @param trackId is the id of the track that we seek to retrieve.
   * @returns a JSON with the information of a song.
   * @throws an error when the method could not get the track. This will happen if either the trackId
   * is invalid or the auth token is not valid / expired.
   */
  public static async track(authToken: string, trackId: string): Promise<unknown> {
    try {
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return 'Failed';
    }
  }

  /**
   * This method uses Spotify API to search for arbitrary information for a given track that is identified
   * by a unique trackId. In order to ensure security, an auth token is used for authentication.
   * @param authToken is the authorizatization token needed for Spotify API to give info.
   * @param query is the search we are making.
   * @param type is the list of types of results we want. For example songs, albums, etc...
   * @param limit is the total number of results we want to see.
   * @returns a JSON with the information we searched for.
   * @throws an error when the method could not search. This will happen if either the types are
   *  invalid or the auth token is not valid / expired, etc...
   */
  public static async search(
    authToken: string,
    query: string,
    type: string,
    limit = 10,
  ): Promise<unknown> {
    const queryParams = QueryString.stringify({
      query,
      type,
      limit,
    });

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return 'Failed';
    }
  }
}
