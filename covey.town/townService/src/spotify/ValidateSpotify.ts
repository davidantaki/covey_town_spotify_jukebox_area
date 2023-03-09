/*
This file is incomplete as it does not format any of this inputs. These results
will be formatted as desired once we know how we will use them.
*/

/**
 * This method formats and cleans the token information received.
 * @param tokenData  is a JSON with the data received from exchanging authorization
 * code for authentication token.
 * @returns the cleaned query results.
 */
export function tokenPipe(tokenData: {
  access_token: string;
  token_type: string;
  expires_in: string;
  refresh_token: string;
}): unknown {
  return tokenData;
}

/**
 * This method formats the Spotify "Tracks" endpoint response as "desired".
 * @param trackData is a JSON with the data from the "Tracks" Spotify API call
 * @returns the cleaned query results.
 */
export function trackPipe(trackData: {
  album: unknown;
  artists: unknown;
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: unknown;
  external_urls: unknown;
  href: unknown;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}): unknown {
  return trackData;
}

/**
 * This method formats the Spotify "Search" endpoint response as "desired".
 * @param searchData is a JSON with the data from the "Search" Spotify API call
 * @returns the cleaned query results.
 */
export function searchPipe(searchData: unknown): unknown {
  return searchData;
}
