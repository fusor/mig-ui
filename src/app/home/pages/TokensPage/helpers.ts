import moment from 'moment-timezone';
import { IToken } from '../../../token/duck/types';
import { StatusType } from '../../../common/components/StatusIcon';

const EXPIRATION_WARNING_THRESHOLD_HOURS = 1;

export const getTokenInfo = (token: IToken) => {
  const expirationTimestamp = token.MigToken.status.expiresAt;
  const expirationMoment = moment(expirationTimestamp);
  const formattedExpiration = expirationMoment
    .tz(moment.tz.guess())
    .format('DD MMM YYYY, hh:mm:ss A z');
  const hoursUntilExpiration = expirationMoment.diff(moment(), 'hours', true);
  let statusType: StatusType;
  let statusText: string;
  if (hoursUntilExpiration < 0) {
    statusType = StatusType.ERROR;
    statusText = 'Expired';
  } else if (hoursUntilExpiration < EXPIRATION_WARNING_THRESHOLD_HOURS) {
    statusType = StatusType.WARNING;
    statusText = 'Expiring soon';
  } else {
    statusType = StatusType.OK;
    statusText = 'OK';
  }
  return {
    tokenName: token.MigToken.metadata.name,
    type: token.MigToken.status.type,
    expirationTimestamp,
    formattedExpiration,
    associatedClusterName: token.MigToken.spec.migClusterRef.name,
    statusType,
    statusText,
  };
};

export type ITokenInfo = ReturnType<typeof getTokenInfo>;
