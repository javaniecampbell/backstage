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

import { isValidElement, ReactElement, ReactNode } from 'react';
import { BackstageRouteObject, RouteRef } from '../routing/types';
import { getComponentData } from '../extensions';
import { createCollector } from '../extensions/traversal';

function getMountPoint(node: ReactElement): RouteRef | undefined {
  const element: ReactNode = node.props?.element;

  let routeRef = getComponentData<RouteRef>(node, 'core.mountPoint');
  if (!routeRef && isValidElement(element)) {
    routeRef = getComponentData<RouteRef>(element, 'core.mountPoint');
  }

  return routeRef;
}

export const routePathCollector = createCollector(
  () => new Map<RouteRef, string>(),
  (acc, node, parent) => {
    if (parent?.props.element === node) {
      return;
    }

    const routeRef = getMountPoint(node);
    if (routeRef) {
      const path: string | undefined = node.props?.path;
      if (!path) {
        throw new Error('Mounted routable extension must have a path');
      }
      acc.set(routeRef, path);
    }
  },
);

export const routeParentCollector = createCollector(
  () => new Map<RouteRef, RouteRef | undefined>(),
  (acc, node, parent, parentRouteRef?: RouteRef) => {
    if (parent?.props.element === node) {
      return parentRouteRef;
    }

    let nextParent = parentRouteRef;

    const routeRef = getMountPoint(node);
    if (routeRef) {
      acc.set(routeRef, parentRouteRef);
      nextParent = routeRef;
    }

    return nextParent;
  },
);

export const routeObjectCollector = createCollector(
  () => Array<BackstageRouteObject>(),
  (acc, node, parent, parentChildArr: BackstageRouteObject[] = acc) => {
    if (parent?.props.element === node) {
      return parentChildArr;
    }

    const path: string | undefined = node.props?.path;
    const caseSensitive: boolean = Boolean(node.props?.caseSensitive);

    const routeRef = getMountPoint(node);
    if (routeRef) {
      const children: BackstageRouteObject[] = [];
      if (!path) {
        throw new Error(`No path found for mount point ${routeRef}`);
      }
      parentChildArr.push({
        caseSensitive,
        path,
        element: null,
        routeRef,
        children,
      });
      return children;
    }

    return parentChildArr;
  },
);
