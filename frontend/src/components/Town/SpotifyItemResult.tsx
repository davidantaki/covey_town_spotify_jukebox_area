import { Button } from '@chakra-ui/react';
import { TableCell, TableRow } from '@material-ui/core';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import React from 'react';
import { Song } from '../../classes/JukeBoxAreaController';

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
  const addSongToQueueClickHandler = async () => {
    const song: Song = {
      title: songTitle,
      artists: [songArtist],
      spotifyId: songUri,
      addedBy: 'test',
      upvotes: 0,
      songJson: {
        id: '',
        name: '',
        artists: [],
        album: {
          id: '',
          name: '',
        },
      },
    };
    addSongToQueueFunc(song);
  };

  const formatDuration = (duration: string) => {
    const numDuration: number = +duration;
    const secondsTotal = Math.floor(numDuration / 1000);
    const minutes = Math.floor(secondsTotal / 60);
    const seconds = secondsTotal - minutes * 60;
    const formattedSeconds = seconds > 9 ? seconds.toString() : `0${seconds.toString()}`;
    return `${minutes}:${formattedSeconds}`;
  };

  return (
    <TableRow>
      <TableCell> {songTitle} </TableCell>
      <TableCell> {songArtist}</TableCell>
      <TableCell> {formatDuration(songDuration)}</TableCell>
      <TableCell>
        <Button onClick={addSongToQueueClickHandler}>
          <QueueMusicIcon />
        </Button>
      </TableCell>
    </TableRow>
  );
}
