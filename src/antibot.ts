import { BigInt, Bytes, store } from "@graphprotocol/graph-ts"
import {
  Antibot,
  AdminChanged,
  AntibotActiveChanged,
  AuthorityChanged,
  BeaconUpgraded,
  Initialized,
  MarkedBlacklisted,
  MarkedProtected,
  MarkedUnthrottled,
  MarkedWhitelisted,
  MaxTransferAmountChanged,
  OwnershipTransferred,
  TradingStartChanged,
  Upgraded
} from "../generated/Antibot/Antibot"
import { 
  BlacklistedAccount, 
  Owner, 
  ProtectedAccount, 
  Token, 
  UnthrottledAccount,
  User, 
  WhitelistedAccount 
} from "../generated/schema"

export function handleAdminChanged(event: AdminChanged): void {}

export function handleAntibotActiveChanged(event: AntibotActiveChanged): void {
  let token = new Token(event.params.token);

  token.antibotActive = event.params.active;

  token.save();
}

export function handleAuthorityChanged(event: AuthorityChanged): void {
  let token = Token.load(event.params.target);

  if (!token) {
    token = new Token(event.params.target);

    token.antibotActive = false;
    token.tradingStart = BigInt.fromI32(0);
    token.maxTransferAmount = BigInt.fromI32(0);

    token.save();
  }

  let user = User.load(event.params.user);

  if (!user) {
    user = new User(event.params.user);

    user.save();
  }

  let owner = Owner.load(event.params.target.concat(event.params.user));

  if (event.params.authorized) {
    if (!owner) {
      owner = new Owner(event.params.target.concat(event.params.user));

      owner.token = token.id;
      owner.user = user.id;

      owner.save();
    }
  } else {
    if (owner)
      store.remove('Owner', event.params.target.concat(event.params.user).toHexString());
  }
}

export function handleBeaconUpgraded(event: BeaconUpgraded): void {}

export function handleInitialized(event: Initialized): void {}

export function handleMarkedBlacklisted(event: MarkedBlacklisted): void {
  let token = Token.load(event.params.token);

  if (!token) {
    token = new Token(event.params.token);

    token.antibotActive = false;
    token.tradingStart = BigInt.fromI32(0);
    token.maxTransferAmount = BigInt.fromI32(0);

    token.save();
  }

  let user = User.load(event.params.account);

  if (!user) {
    user = new User(event.params.account);

    user.save();
  }

  let blacklistedAccount = BlacklistedAccount.load(event.params.token.concat(event.params.account));

  if (event.params.isBlacklisted) {
    if (!blacklistedAccount) {
      blacklistedAccount = new BlacklistedAccount(event.params.token.concat(event.params.account));

      blacklistedAccount.token = token.id;
      blacklistedAccount.user = user.id;

      blacklistedAccount.save();
    }
  } else {
    if (blacklistedAccount)
      store.remove('BlacklistedAccount', event.params.token.concat(event.params.account).toHexString());
  }
}

export function handleMarkedProtected(event: MarkedProtected): void {
  let token = Token.load(event.params.token);

  if (!token) {
    token = new Token(event.params.token);

    token.antibotActive = false;
    token.tradingStart = BigInt.fromI32(0);
    token.maxTransferAmount = BigInt.fromI32(0);

    token.save();
  }

  let user = User.load(event.params.account);

  if (!user) {
    user = new User(event.params.account);

    user.save();
  }

  let protectedAccount = ProtectedAccount.load(event.params.token.concat(event.params.account));

  if (event.params.isProtected) {
    if (!protectedAccount) {
      protectedAccount = new ProtectedAccount(event.params.token.concat(event.params.account));

      protectedAccount.token = token.id;
      protectedAccount.user = user.id;

      protectedAccount.save();
    }
  } else {
    if (protectedAccount)
      store.remove('ProtectedAccount', event.params.token.concat(event.params.account).toHexString());
  }
}

export function handleMarkedUnthrottled(event: MarkedUnthrottled): void {
  let token = Token.load(event.params.token);

  if (!token) {
    token = new Token(event.params.token);

    token.antibotActive = false;
    token.tradingStart = BigInt.fromI32(0);
    token.maxTransferAmount = BigInt.fromI32(0);

    token.save();
  }

  let user = User.load(event.params.account);

  if (!user) {
    user = new User(event.params.account);

    user.save();
  }

  let unthrottledAccount = UnthrottledAccount.load(event.params.token.concat(event.params.account));

  if (event.params.isUnthrottled) {
    if (!unthrottledAccount) {
      unthrottledAccount = new UnthrottledAccount(event.params.token.concat(event.params.account));

      unthrottledAccount.token = token.id;
      unthrottledAccount.user = user.id;

      unthrottledAccount.save();
    }
  } else {
    if (unthrottledAccount)
      store.remove('UnthrottledAccount', event.params.token.concat(event.params.account).toHexString());
  }
}

export function handleMarkedWhitelisted(event: MarkedWhitelisted): void {
  let token = Token.load(event.params.token);

  if (!token) {
    token = new Token(event.params.token);

    token.antibotActive = false;
    token.tradingStart = BigInt.fromI32(0);
    token.maxTransferAmount = BigInt.fromI32(0);

    token.save();
  }

  let user = User.load(event.params.account);

  if (!user) {
    user = new User(event.params.account);

    user.save();
  }

  let whitelistedAccount = WhitelistedAccount.load(event.params.token.concat(event.params.account));

  if (event.params.isWhitelisted) {
    if (!whitelistedAccount) {
      whitelistedAccount = new WhitelistedAccount(event.params.token.concat(event.params.account));

      whitelistedAccount.token = token.id;
      whitelistedAccount.user = user.id;

      whitelistedAccount.save();
    }
  } else {
    if (whitelistedAccount)
      store.remove('WhitelistedAccount', event.params.token.concat(event.params.account).toHexString());
  }
}

export function handleMaxTransferAmountChanged(
  event: MaxTransferAmountChanged
): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTradingStartChanged(event: TradingStartChanged): void {}

export function handleUpgraded(event: Upgraded): void {}
