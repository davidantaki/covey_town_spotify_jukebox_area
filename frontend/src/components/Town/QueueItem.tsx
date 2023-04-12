import { Button } from '@chakra-ui/react';
import { Grid, TableCell, TableRow } from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import React, { useState } from 'react';
import { Song } from '../../classes/JukeBoxAreaController';

export function QueueItem({ song, onUpvote }: { song: Song; onUpvote: () => void }): JSX.Element {
  const [upvoted, setUpvoted] = useState(false);
  const onUpvoteClicked = () => {
    setUpvoted(up => !up);
    onUpvote();
  };
  return (
    <TableRow>
      <TableCell> {song.title} </TableCell>
      <TableCell> {song.artists}</TableCell>
      <TableCell>
        <Grid container alignItems='center'>
          <Button
            onClick={onUpvoteClicked}
            style={{
              maxWidth: '30px',
              maxHeight: '30px',
              minWidth: '30px',
              minHeight: '30px',
              marginRight: '10px',
            }}>
            {upvoted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
          </Button>
          {song.upvotes}
        </Grid>
      </TableCell>
    </TableRow>
  );
}
