import OneSignal from 'react-onesignal';

export class MyOneSignal {
    initializeOneSignal = async (appId: string) => {
        console.log('init started...')
        return new Promise<void>((resolve, reject) => {
            OneSignal.init({ appId: appId, allowLocalhostAsSecureOrigin: true }).then(e => {
                console.log('onsignal loaded');
                resolve();
            }).catch(e => {
                console.log('error while loading onesignal on logout', e)
                resolve();
            })
            setTimeout(() => {
                resolve();
                console.log('Onesignal does not resolve the init in 3 sec, so resolving forcefully')
            }, 3500)
        })     
    }

    login(userId: string) {
        OneSignal.Slidedown.promptPush();
        OneSignal.login(userId);   
    }

    async logout(appId: string) {
        await this.initializeOneSignal(appId);
        OneSignal.logout()
    }
}