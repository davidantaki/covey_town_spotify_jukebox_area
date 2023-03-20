class Song {
  // The title of the song
  title: string;

  // The artist of the song
  artist: string;

  // The spotifyID of the song
  spotifyId: string;

  // The id of the player that added the song
  addedBy: string;

  // The number of upvotes the song has received
  upvotes: number;

  // The number of downvotes the song has received
  downvotes: number;

  // The JSON for the song that is received from getSong
  songJson: string;

  constructor(
    title: string,
    artist: string,
    spotifyId: string,
    addedBy: string,
    upvotes: number,
    downvotes: number,
    songJson: string,
  ) {
    this.title = title;
    this.artist = artist;
    this.spotifyId = spotifyId;
    this.addedBy = addedBy;
    this.upvotes = upvotes;
    this.downvotes = downvotes;
    this.songJson = songJson;
  }

  getNetVotes(): number {
    return this.upvotes - this.downvotes;
  }
}
