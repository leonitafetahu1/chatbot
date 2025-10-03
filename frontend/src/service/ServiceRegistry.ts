// src/service/ServiceRegistry.ts
import {config} from '@/config/environment';
import type {IUserService} from "@/service/types/user.types.ts";
import {MockUserService} from "@/service/mock/MockUserService.ts";
import type {ICustomerService} from "@/service/types/customer.types.ts";
import {MockCustomerService} from "@/service/mock/MockCustomerService.ts";

// Define the structure of our service container
interface IServiceRegistry {
    users: IUserService;
    customers: ICustomerService;
}

class ServiceRegistryFactory {
    private serviceCache = new Map<string, IServiceRegistry>();

    private createServices(mode: 'mock'): IServiceRegistry {
        console.log('=== ServiceRegistry Debug ===');
        console.log('Config mode:', mode);

        return {
            users: new MockUserService(),
            customers: new MockCustomerService(),
        };

    }

    getServices(headers?: Record<string, string | undefined>): IServiceRegistry {
        // If headers are provided, temporarily set context for config.mode to work
        if (headers) {
            globalThis.__request_headers__ = headers;
        }

        const mode = config.mode;

        // Cache services per mode to avoid recreating instances unnecessarily
        if (!this.serviceCache.has(mode)) {
            this.serviceCache.set(mode, this.createServices(mode));
        }

        return this.serviceCache.get(mode)!;
    }
}

const serviceRegistryFactory = new ServiceRegistryFactory();

export const ServiceRegistry = serviceRegistryFactory.getServices();