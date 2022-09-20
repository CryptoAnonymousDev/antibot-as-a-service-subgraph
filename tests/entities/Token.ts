class Token {
    id: string = 'id';
    antibotActive: string = 'antibotActive';
    tradingStart: string = 'tradingStart';
    maxTransferAmount: string = 'maxTransferAmount'
    owners: string = 'owners';
    whitelistedAccounts: string = 'whitelistedAccounts';
    unthrottledAccounts: string = 'unthrottledAccounts';
    protectedAccounts: string = 'protectedAccounts';
    blacklistedAccounts: string = 'blacklistedAccounts';
}

export const TOKEN = new Token();