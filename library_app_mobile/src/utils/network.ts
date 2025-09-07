import NetInfo from '@react-native-community/netinfo';
import { processQueue } from '../storage/db';
import { client } from '../api/client';

export const setupNetworkListener = () => {
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      processQueue(client).catch(console.error);
    }
  });
};