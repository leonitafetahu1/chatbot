import type {IUserService} from '@/service/types/user.types.ts';
import type {ICustomerService} from '@/service/types/customer.types.ts';
import type {IChatService} from '@/service/types/chat.types.ts';
import { MockUserService } from '@/service/mock/MockUserService.ts';
import { MockCustomerService } from '@/service/mock/MockCustomerService.ts';
import { MockChatService } from '@/service/mock/MockChatService.ts';

export interface IServiceRegistry {
  users: IUserService;
  customers: ICustomerService;
  chat: IChatService;
}

export function createRegistry(): IServiceRegistry {
  return {
    users: new MockUserService(),
    customers: new MockCustomerService(),
    chat: new MockChatService(),
  };
}


