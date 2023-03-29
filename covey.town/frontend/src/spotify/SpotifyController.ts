import * as dotenv from 'dotenv';
import axios from 'axios';
import QueryString from 'qs';
import { searchPipe, tokenPipe, trackPipe } from './ValidateSpotify';

dotenv.config({ path: '/.env' });
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } = process.env;

/**
 * Abstraction layer in code to communicate with Spotify API to receive authenication,
 * track information, and more.
 */
export default class SpotifyController {
  /**
   * This method uses Spotify API method of exchanging the authorization
   * code for an authentication token to be used to get track info and more.
   * @param code is an authorization code to be exchanged for token.
   * @returns an authentication token that can be used to get information from Spotify API.
   * @throws when the authorization code is invalid or when an unknown error occurs.
   */
  public static async token(code: string | null): Promise<unknown> {
    const response = axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      },
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
        ).toString('base64')}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
      .then(res => {
        if (res.status === 200) {
          return tokenPipe(res.data);
        }
        return res;
      })
      .catch(error => {
        throw new Error(error);
      });
    return response;
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
    const response = axios({
      method: 'get',
      url: `https://api.spotify.com/v1/tracks/${trackId}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (res.status === 200) {
          return trackPipe(res.data);
        }
        return res;
      })
      .catch(error => {
        throw new Error(error);
      });
    return response;
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
    const response = axios({
      method: 'get',
      url: `https://api.spotify.com/v1/search?${queryParams}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (res.status === 200) {
          return searchPipe(res.data);
        }
        return res;
      })
      .catch(error => {
        throw new Error(error);
      });
    return response;
  }
}
