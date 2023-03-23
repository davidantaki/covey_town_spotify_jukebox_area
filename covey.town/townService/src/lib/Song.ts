class Song {
  // The title of the song
  private _title: string;

  // The artists of the song
  private _artists: [];

  // The spotifyID of the song
  private _spotifyId: string;

  // The id of the player that added the song
  private _addedBy: string;

  // The number of upvotes the song has received
  private _upvotes: number;

  // The number of downvotes the song has received
  private _downvotes: number;

  // The JSON for the song that is received from getSong
  private _songJson: any;

  constructor(addedBy: string, songJson: any) {
    this._title = songJson.name;
    this._artists = songJson.artists.map((artist: { name: string }) => artist.name);
    this._spotifyId = songJson.id;
    this._addedBy = addedBy;
    this._upvotes = 0;
    this._downvotes = 0;
    this._songJson = songJson;
  }

  get title(): string {
    return this._title;
  }

  set title(title: string) {
    this._title = title;
  }

  get artists(): [] {
    return this._artists;
  }

  set artists(artists: []) {
    this._artists = artists;
  }

  get spotifyId(): string {
    return this._spotifyId;
  }

  set spotifyId(spotifyId: string) {
    this._spotifyId = spotifyId;
  }

  get addedBy(): string {
    return this._addedBy;
  }

  set addedBy(addedBy: string) {
    this._addedBy = addedBy;
  }

  get upvotes(): number {
    return this._upvotes;
  }

  set upvotes(upvotes: number) {
    this._upvotes = upvotes;
  }

  get downvotes(): number {
    return this._downvotes;
  }

  set downvotes(downvotes: number) {
    this._downvotes = downvotes;
  }

  get songJson(): string {
    return this._songJson;
  }

  set songJson(songJson: string) {
    this._songJson = songJson;
  }

  getNetVotes(): number {
    return this.upvotes - this.downvotes;
  }
}
