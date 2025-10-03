import {config} from "@/config/environment.ts";
import delay from "@/utils/delay.ts";
import {mock_customer_api_keys, mock_customers} from "@/service/mock/data/customer.data.ts";
import type {CustomerApiKey, CustomerData, ICustomerService} from "@/service/types/customer.types.ts";


export class MockCustomerService implements ICustomerService {
    private mockCustomerApiKeys: CustomerApiKey[] = [...mock_customer_api_keys];
    private mockCustomerData: CustomerData[] = [...mock_customers];

    async getAllApiKeys(): Promise<CustomerApiKey[]> {
        await delay(config.mock_delay_ms);
        return this.mockCustomerApiKeys;
    }

    async getAllCustomers(): Promise<CustomerData[]> {
        await delay(config.mock_delay_ms);
        return this.mockCustomerData;
    }
}