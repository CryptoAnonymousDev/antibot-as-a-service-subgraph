export class User {
    id: string = 'id';
    ownerTokens: string = 'ownerTokens';
    whitelistedTokens: string = 'whitelistedTokens';
    unthrottledTokens: string = 'unthrottledTokens';
    protectedTokens: string = 'protectedTokens';
    blacklistedTokens: string = 'blacklistedTokens';
}

export const USER = new User();