export function searchPipe(searchData: unknown): unknown {
  return searchData;
}

export function tokenPipe(tokenData: {
  access_token: string;
  token_type: string;
  expires_in: string;
  refresh_token: string;
}): unknown {
  return tokenData;
}

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
