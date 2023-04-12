import { Box, Button, Flex, GridItem, Input, InputGroup, VStack } from '@chakra-ui/react';
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
import { SearchItemType, SearchResultsType } from './interactables/JukeBoxAreaSearchAndQueue';
import { SearchResult } from './SpotifyItemResult';

/**
 * SpotifySearchResult is the component that is the left half of the JukeBoxArea, where it will
 * let users search, nagivate, and add songs to the communal queue. They can also view the duration
 * of the songs here.
 * @param props is a set of properties: searchValue, handleSearchChange, findSongs, searchResults,
 * and addSongToQueue, where searchValue is what is being searched, handleSearchChange is how we respond
 * to changes in the search, findSongs is a function to find all the songs based on the keyword, search
 * results is the information that is to be rendered for the results, and addSongToQueue is a function
 * that handles the adding of a song to the communal queue.
 */
export function SpotifySearchResult({
  searchValue,
  handleSearchChange,
  findSongs,
  searchResults,
  addSongToQueue,
}: {
  searchValue: string;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  findSongs: () => void;
  searchResults: SearchResultsType | undefined;
  addSongToQueue: (song: Song) => void;
}): JSX.Element {
  return (
    <GridItem colSpan={25}>
      <Flex gap={'5px'}>
        <Box width={'85%'} marginLeft={'2%'}>
          <InputGroup>
            <Input
              pr='4.5rem'
              type='tel'
              value={searchValue}
              onChange={handleSearchChange}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  findSongs();
                }
              }}
              placeholder='Search Songs'
            />
          </InputGroup>
        </Box>
        <Box width={'15%'} marginRight={'2%'}>
          <Button width={'100%'} onClick={findSongs}>
            Search!
          </Button>
        </Box>
      </Flex>
      <VStack>
        <TableContainer style={{ paddingLeft: '2%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bolder' }}>Title</TableCell>
                <TableCell style={{ fontWeight: 'bolder' }}>Artist</TableCell>
                <TableCell style={{ fontWeight: 'bolder' }}>Duration</TableCell>
                <TableCell style={{ fontWeight: 'bolder' }}>+ Queue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Map search results response to SearchResults */}
              {searchResults?.tracks?.items?.map((item: SearchItemType) => {
                return (
                  <SearchResult
                    key={item.id}
                    songTitle={item.name}
                    songArtist={item.artists[0].name}
                    songDuration={item.duration_ms}
                    songUri={item.uri}
                    addSongToQueueFunc={addSongToQueue}
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
