import { InjectionToken } from '@angular/core';

import { configLoadFactory } from './infrastructure/config/config.factory';
import { ConfigService } from './infrastructure/config/config.service';
import { AuthService } from './infrastructure/auth/auth.service';
import { authCheckFactory } from './infrastructure/auth/auth.factory';

export const CONFIG_DEPS = new InjectionToken<(() => Function)[]>('CONFIG_DEPENDENCIES');

// Use a factory that return an array of dependant functions to be executed
export function configDepsFactory(authService: AuthService, configService: ConfigService) {
    return [authCheckFactory(authService, configService)]
}

//https://medium.com/@gmurop/managing-dependencies-among-app-initializers-in-angular-652be4afce6f
export function cmsInitializer(configService: ConfigService, configDeps: (() => Function)[]): () => Promise<any> {
    return (): Promise<any> => new Promise((resolve, reject) => {
        configLoadFactory(configService)()
            .then(data => {
                // Return resolved Promise when dependant functions are resolved
                return Promise.all(configDeps.map(dep => dep())); // configDeps received from the outside world
            })
            .then(() => {
                // Once configuration dependencies are resolved, then resolve factory
                resolve();
            })
            .catch(() => {
                reject();
            });
    });
}