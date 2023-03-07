import * as dotenv from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import QueryString from 'qs';

dotenv.config({ path: '/.env' });

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } = process.env;

/**
 * Retrieves track from spotify API
 */
export default class TownsController {
  public static async getCode(): Promise<AxiosResponse> {
    const queryParams = QueryString.stringify({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
    });
    try {
      const res = await axios({
        method: 'get',
        url: `https://accounts.spotify.com/authorize?${queryParams}`,
      });
      return res.data.code;
    } catch {
      throw new Error('Could not authorize');
    }
  }

  public static async getToken(): Promise<AxiosResponse> {
    const code = this.getCode() || null;
    try {
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
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const token = res.data.access_token;
      return token;
    } catch (error) {
      throw new Error('could not get auth token');
    }
  }

  public static async getTrack(trackId: string): Promise<AxiosResponse> {
    const auth = TownsController.getToken();

    const res = await axios({
      method: 'get',
      url: `https://api.spotify.com/v1/tracks/${trackId}`,
      headers: {
        Authorization: `Bearer ${auth}`,
      },
    });

    return res;
  }
}
