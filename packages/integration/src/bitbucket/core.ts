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

import parseGitUrl from 'git-url-parse';
import { BitbucketIntegrationConfig } from './config';

/**
 * Given a URL pointing to a file on a provider, returns a URL that is suitable
 * for fetching the contents of the data.
 *
 * Converts
 * from: https://bitbucket.org/orgname/reponame/src/master/file.yaml
 * to:   https://api.bitbucket.org/2.0/repositories/orgname/reponame/src/master/file.yaml
 *
 * @param url A URL pointing to a file
 * @param config The relevant provider config
 */
export function getBitbucketFileFetchUrl(
  url: string,
  config: BitbucketIntegrationConfig,
): string {
  try {
    const { owner, name, ref, filepathtype, filepath } = parseGitUrl(url);
    if (
      !owner ||
      !name ||
      (filepathtype !== 'browse' &&
        filepathtype !== 'raw' &&
        filepathtype !== 'src')
    ) {
      throw new Error('Invalid Bitbucket URL or file path');
    }

    const pathWithoutSlash = filepath.replace(/^\//, '');

    if (config.host === 'bitbucket.org') {
      if (!ref) {
        throw new Error('Invalid Bitbucket URL or file path');
      }
      return `${config.apiBaseUrl}/repositories/${owner}/${name}/src/${ref}/${pathWithoutSlash}`;
    }
    return `${config.apiBaseUrl}/projects/${owner}/repos/${name}/raw/${pathWithoutSlash}?at=${ref}`;
  } catch (e) {
    throw new Error(`Incorrect URL: ${url}, ${e}`);
  }
}

/**
 * Gets the request options necessary to make requests to a given provider.
 *
 * @param config The relevant provider config
 */
export function getBitbucketRequestOptions(
  config: BitbucketIntegrationConfig,
): RequestInit {
  const headers: HeadersInit = {};

  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  } else if (config.username && config.appPassword) {
    const buffer = Buffer.from(
      `${config.username}:${config.appPassword}`,
      'utf8',
    );
    headers.Authorization = `Basic ${buffer.toString('base64')}`;
  }

  return {
    headers,
  };
}
