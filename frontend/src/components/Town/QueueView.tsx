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

/**
 * The QueueView component renders the entirety of the queue including the curerent song being played,
 * the status of our spotify player, and the queue. 
 * @param props is a set of properties: upvoteSong, sortedQueue, authToken, currentTrack, where
 * upvoteSong tels us how to hand upvotes across all the songs, sortedQueue is the queue to render,
 * authToken is the token we receive from Spotify to play songs, and currentTrack is the current song
 * that is to be played. 
] */
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
