import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { STACKS_MAINNET, STACKS_TESTNET, STACKS_MOCKNET } from '@stacks/network';

export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export function authenticate() {
  showConnect({
    appDetails: {
      name: 'BitLot',
      icon: 'https://cryptologos.cc/logos/stacks-stx-logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

export function getNetwork() {
  const network = process.env.NEXT_PUBLIC_NETWORK || 'mocknet';
  switch (network) {
    case 'mainnet':
      return STACKS_MAINNET;
    case 'testnet':
      return STACKS_TESTNET;
    default:
      return STACKS_MOCKNET;
  }
}
