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
import { BlacklistedAccount, Owner, Token, User } from "../generated/schema"

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

export function handleMarkedProtected(event: MarkedProtected): void {}

export function handleMarkedUnthrottled(event: MarkedUnthrottled): void {}

export function handleMarkedWhitelisted(event: MarkedWhitelisted): void {}

export function handleMaxTransferAmountChanged(
  event: MaxTransferAmountChanged
): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTradingStartChanged(event: TradingStartChanged): void {}

export function handleUpgraded(event: Upgraded): void {}
