import * as crypto from 'crypto';

export const stringToSha1 = (str: string): string => {
  const shasum = crypto.createHash('sha1');
  shasum.update(str);
  return shasum.digest('hex');
};
export const generateAuthToken = (salt: string): string => {
  return stringToSha1(salt + new Date().getTime());
};
