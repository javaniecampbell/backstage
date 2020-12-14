/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { CSSProperties } from 'react';
import {
  Avatar as MaterialAvatar,
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatar: {
      width: '4rem',
      height: '4rem',
      color: '#fff',
      fontWeight: theme.typography.fontWeightBold,
      letterSpacing: '1px',
      textTransform: 'uppercase',
    },
  }),
);

const stringToColour = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += `00${value.toString(16)}`.substr(-2);
  }
  return colour;
};

export const Avatar = ({
  displayName,
  picture,
  customStyles,
}: {
  displayName: string | undefined;
  picture: string | undefined;
  customStyles?: CSSProperties;
}) => {
  const classes = useStyles();
  return (
    <MaterialAvatar
      alt={displayName}
      src={picture}
      className={classes.avatar}
      style={{
        backgroundColor: stringToColour(displayName || picture || ''),
        ...customStyles,
      }}
    >
      {displayName && displayName.match(/\b\w/g)!.join('').substring(0, 2)}
    </MaterialAvatar>
  );
};
