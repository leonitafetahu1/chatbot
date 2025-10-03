export interface CustomerApiKey {
    stripe: string;
    aws: string;
}


export interface CustomerData {
    id: number;
    name: string;
    email: string;
    role: string;
}


export interface ICustomerService {
    getAllApiKeys(): Promise<CustomerApiKey[]>;
    getAllCustomers(): Promise<CustomerData[]>;
}