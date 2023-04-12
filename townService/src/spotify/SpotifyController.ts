import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const { SPOTIFY_CLIENT_ID } = process.env;
const { SPOTIFY_CLIENT_SECRET } = process.env;
const { SPOTIFY_REDIRECT_URI } = process.env;

export interface SpotifyTokenResponse {
  status: number;
  data: {
    access_token: string;
  };
}

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
  public static async token(code: string | null): Promise<SpotifyTokenResponse> {
    const res = await axios({
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
    });
    return res;
  }
}
