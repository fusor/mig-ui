import { IMigMetaVars } from './types';

export const DOWNSTREAM_TITLE = 'Migration Toolkit for Containers';
export const UPSTREAM_TITLE = 'Crane';
export const MIG_META: IMigMetaVars = JSON.parse(atob(window['_mig_meta']));
