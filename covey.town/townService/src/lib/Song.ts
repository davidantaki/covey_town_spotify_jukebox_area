class Song {
  // The title of the song
  private _title: string;

  // The artists of the song
  private _artists: string[];

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
    this._songJson = { ...songJson };
  }

  get title(): string {
    return this._title;
  }

  get artists(): string[] {
    return this._artists;
  }

  get spotifyId(): string {
    return this._spotifyId;
  }

  get addedBy(): string {
    return this._addedBy;
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

  getNetVotes(): number {
    return this.upvotes - this.downvotes;
  }
}
