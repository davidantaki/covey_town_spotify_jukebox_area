import QueryString from 'qs';
import { SearchResultsType } from '../components/Town/interactables/JukeBoxAreaSearchAndQueue';

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

  public static getAuthorizationLink(): string {
    const generateRandomString = (length: number) => {
      let text = '';
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };
    const state = generateRandomString(16);
    const scope =
      'app-remote-control\
      streaming\
      user-read-private\
      user-read-email\
      user-modify-playback-state\
      user-read-playback-state\
      user-read-currently-playing\
      playlist-read-collaborative\
      playlist-modify-public\
      playlist-read-private\
      playlist-modify-private\
      user-library-modify\
      user-library-read\
      user-read-playback-position';

    return (
      'https://accounts.spotify.com/authorize?' +
      QueryString.stringify({
        response_type: 'code',
        client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REACT_APP_SPOTIFY_REDIRECT_URI,
        state: state,
      })
    );
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
      console.log('failed');
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
  ): Promise<SearchResultsType | undefined> {
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
      console.log(error);
    }
  }

  /**
   * Play a song on Spotify.
   */
  public static async playTrack(authToken: string, trackUri: string): Promise<unknown> {
    const devices = await this.getDevices(authToken);
    // needs to be bolstered
    const deviceId = devices[0].id;
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          uris: [trackUri],
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  static async getDevices(authToken: string): Promise<{ id: string }[]> {
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/devices`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      return data.devices;
    } catch (error) {
      console.log(error);
      throw Error('error');
    }
  }
}
