import { Button } from '@chakra-ui/react';
import { TableCell, TableRow } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import React from 'react';
import SpotifyController from '../../spotify/SpotifyController';
import { Song } from './interactables/JukeBoxAreaSearchAndQueue';

export function SearchResult({
  songTitle,
  songArtist,
  songDuration,
  songUri,
  addSongToQueueFunc,
}: {
  songTitle: string;
  songArtist: string;
  songDuration: string;
  songUri: string;
  addSongToQueueFunc: (song: Song) => void;
}): JSX.Element {
  const playClickHandler = async () => {
    const token = localStorage.getItem('spotifyAuthToken');
    if (token) {
      await SpotifyController.playTrack(token, songUri);
    }
  };
  const addSongToQueueClickHandler = async () => {
    const song: Song = {
      title: songTitle,
      artists: [songArtist],
      spotifyId: songUri,
      addedBy: 'test',
      upvotes: 0,
      songJson: {},
    };
    addSongToQueueFunc(song);
  };

  return (
    <TableRow>
      <TableCell> {songTitle} </TableCell>
      <TableCell> {songArtist}</TableCell>
      <TableCell> {songDuration}</TableCell>
      <TableCell>
        <Button onClick={playClickHandler}>
          <PlayArrowIcon />
        </Button>
      </TableCell>
      <TableCell>
        <Button onClick={addSongToQueueClickHandler}>
          <QueueMusicIcon />
        </Button>
      </TableCell>
    </TableRow>
  );
}
