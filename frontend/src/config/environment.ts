// src/config/environment.ts
export type AppMode = 'mock';

class EnvironmentConfig {
    private readonly mockDelayMs = 250;

    getMode(): AppMode {
        return "mock";
    }

    getConfig() {
        return {
            mode: this.getMode(),
            mock_delay_ms: this.mockDelayMs,
        };
    }
}

// Singleton
export const environmentConfig = new EnvironmentConfig();

// Proxy for live values
export const config = new Proxy({
    mode: 'mock' as AppMode,
    mock_delay_ms: 100,
}, {
    get(_target, prop) {
        switch (prop) {
            case 'mode':
                return environmentConfig.getMode();
            case 'mock_delay_ms':
                return environmentConfig['mockDelayMs'];
            default:
                return undefined;
        }
    }
});
