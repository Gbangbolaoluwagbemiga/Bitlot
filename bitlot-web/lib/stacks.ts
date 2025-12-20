import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMocknet } from '@stacks/network';

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

// Use Devnet/Mocknet for local development
export const network = new StacksMocknet({ url: 'http://localhost:3999' });
