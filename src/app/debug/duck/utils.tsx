import React from 'react';
import { TreeViewDataItem } from '@patternfly/react-core';
import { IDebugRefWithStatus, IDebugTreeNode } from './types';
import crawl from 'tree-crawl';
import TreeActionsDropdown from '../../home/pages/PlanDebugPage/components/TreeActionsDropdown';
import TreeViewStatusIcon from '../components/TreeViewStatusIcon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
const uuidv1 = require('uuid/v1');

const getShallowPropsForNode = (
  rawNode: IDebugTreeNode,
  viewRawDebugObject: (node: IDebugTreeNode) => void,
  debugRefs?: IDebugRefWithStatus[]
): TreeViewDataItem => {
  const matchingDebugRef = debugRefs?.find((ref) => ref?.refName === rawNode?.name);
  return {
    id: rawNode.name,
    name: (
      <>
        <span className={`${spacing.mrMd}`}>
          {`${rawNode.kind}: ${rawNode.namespace}/${rawNode.name}`}
        </span>
        <TreeViewStatusIcon debugRef={matchingDebugRef} />
      </>
    ),
    action: <TreeActionsDropdown rawNode={rawNode} viewRawDebugObject={viewRawDebugObject} />,
  };
};

const convertNode = (
  rawNode: IDebugTreeNode,
  ctx,
  viewRawDebugObject: (node: IDebugTreeNode) => void,
  debugRefs
): void => {
  const outNode: TreeViewDataItem = getShallowPropsForNode(rawNode, viewRawDebugObject, debugRefs);

  if (rawNode.children) {
    outNode.children = rawNode.children;
  }

  if (ctx.parent) {
    ctx.parent.children[ctx.index] = outNode;
  }

  ctx.replace(outNode);
};

export const convertRawTreeToViewTree = (
  inTree: IDebugTreeNode,
  debugRefs: any,
  viewRawDebugObject: (node: IDebugTreeNode) => void
): TreeViewDataItem[] => {
  // Deep clone. Not the most efficient, but easy and we're not going for
  // blazing performance here.
  const workingTree: IDebugTreeNode = JSON.parse(JSON.stringify(inTree));

  crawl(
    workingTree,
    (rawNode: IDebugTreeNode, ctx) => convertNode(rawNode, ctx, viewRawDebugObject, debugRefs),
    { order: 'pre' }
  );

  // Doesn't seem to be an easy way from within the crawler to replace
  // the root node, so doing that here and just bringing in the rest of it
  return [
    {
      id: uuidv1(),
      ...getShallowPropsForNode(workingTree, viewRawDebugObject),
      children: workingTree.children,
      defaultExpanded: true,
    },
  ];
};
