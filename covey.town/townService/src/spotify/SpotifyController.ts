import axios, { AxiosResponse } from 'axios';

const SPOTIFY_CLIENT_ID = '97a7d37671c84613aaae12f0d590663a';
const SPOTIFY_CLIENT_SECRET = '3e721586b8c64aa48ecdf01db5d3e6c6';

/**
 * Retrieves track from spotify API
 */
export default class TownsController {
  public static async getAuth(): Promise<AxiosResponse> {
    const res = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'client_credentials',
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: SPOTIFY_CLIENT_ID,
        password: SPOTIFY_CLIENT_SECRET,
      },
    });
    return res;
  }

  public static async getTrack(trackId: string): Promise<AxiosResponse> {
    const auth = TownsController.getAuth();

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
