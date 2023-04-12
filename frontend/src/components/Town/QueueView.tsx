import { GridItem, VStack } from '@chakra-ui/react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import React from 'react';
import { Song } from '../../classes/JukeBoxAreaController';
import { QueueItem } from './QueueItem';
import { SpotifyWebPlayback } from './WebPlaybackSDK';

export function QueueView({
  upvoteSong,
  sortedQueue,
  authToken,
  currentTrack,
}: {
  upvoteSong: (songId: string) => void;
  sortedQueue: Song[];
  authToken: string;
  currentTrack: Song | undefined;
}): JSX.Element {
  return (
    <GridItem colSpan={25}>
      <SpotifyWebPlayback token={authToken} currentTrack={currentTrack} />
      <VStack>
        <TableContainer style={{ paddingRight: '2%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bolder' }}>Title</TableCell>
                <TableCell style={{ fontWeight: 'bolder' }}>Artist</TableCell>
                <TableCell style={{ fontWeight: 'bolder' }}>Vote</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedQueue.map((song: Song) => {
                return (
                  <QueueItem
                    key={song.spotifyId}
                    song={song}
                    onUpvote={() => upvoteSong(song.spotifyId)}
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </VStack>
    </GridItem>
  );
}
