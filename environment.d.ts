declare global {
    namespace NodeJS {
        interface ProcessEnv {
            token: string;
            db: string;
            user: string;
            password: string;
            host: string;
            panel: string;
        }
    }
}

export {};