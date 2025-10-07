// src/service/ServiceRegistry.ts
import {config} from '@/config/environment';
import type { IUserService } from '@/service/types/user.types.ts';
import type { ICustomerService } from '@/service/types/customer.types.ts';
import type { IChatService } from '@/service/types/chat.types.ts';
import { MockUserService } from '@/service/mock/MockUserService.ts';
import { MockCustomerService } from '@/service/mock/MockCustomerService.ts';
import { MockChatService } from '@/service/mock/MockChatService.ts';

// Define the structure of our service container
interface IServiceRegistry {
  users: IUserService;
  customers: ICustomerService;
  chat: IChatService;
}

class ServiceRegistryFactory {
  private serviceCache = new Map<string, IServiceRegistry>();

  private createServices(mode: 'mock'): IServiceRegistry {
    console.log('=== ServiceRegistry Debug ===');
    console.log('Config mode:', mode);

    const role =
      (typeof window !== 'undefined'
        ? localStorage.getItem('user_role')
        : null) || 'user';

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - dynamic import path is resolved by Vite.
    const registryFactory =
      role === 'admin'
        ? () => import('@/service/roles/registry.admin.ts')
        : () => import('@/service/roles/registry.user.ts');

    const placeholder: IServiceRegistry = {
      users: new MockUserService(),
      customers: new MockCustomerService(),
      chat: new MockChatService(),
    };
    return placeholder;
  }

  getServices(headers?: Record<string, string | undefined>): IServiceRegistry {
    // If headers are provided, temporarily set context for config.mode to work
    if (headers) {
      globalThis.__request_headers__ = headers;
    }

    const mode = config.mode;

    // Cache services per mode to avoid recreating instances unnecessarily
    if (!this.serviceCache.has(mode)) {
      // Preload role-specific registry asynchronously, then cache
      const role =
        (typeof window !== 'undefined'
          ? localStorage.getItem('user_role')
          : null) || 'user';
      const loader =
        role === 'admin'
          ? () => import('@/service/roles/registry.admin.ts')
          : () => import('@/service/roles/registry.user.ts');

      loader()
        .then((mod) => {
          this.serviceCache.set(mode, mod.createRegistry());
        })
        .catch(() => {
          this.serviceCache.set(mode, {
            users: new MockUserService(),
            customers: new MockCustomerService(),
            chat: new MockChatService(),
          });
        });
      this.serviceCache.set(mode, this.createServices(mode));
    }

    return this.serviceCache.get(mode)!;
  }
}

const serviceRegistryFactory = new ServiceRegistryFactory();

export const ServiceRegistry = serviceRegistryFactory.getServices();