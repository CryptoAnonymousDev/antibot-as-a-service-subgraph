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
import { Owner, Token, User } from "../generated/schema"

export function handleAdminChanged(event: AdminChanged): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())

  // // Entities only exist after they have been saved to the store;
  // // `null` checks allow to create entities on demand
  // if (!entity) {
  //   entity = new ExampleEntity(event.transaction.from.toHex())

  //   // Entity fields can be set using simple assignments
  //   entity.count = BigInt.fromI32(0)
  // }

  // // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1)

  // // Entity fields can be set based on event parameters
  // entity.previousAdmin = event.params.previousAdmin
  // entity.newAdmin = event.params.newAdmin

  // // Entities can be written to the store with `.save()`
  // entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.assureCanTransfer(...)
  // - contract.isAntibotActive(...)
  // - contract.isAuthorized(...)
  // - contract.isBlacklisted(...)
  // - contract.isProtected(...)
  // - contract.isUnthrottled(...)
  // - contract.isWhitelisted(...)
  // - contract.maxTransferAmount(...)
  // - contract.owner(...)
  // - contract.proxiableUUID(...)
  // - contract.tradingStart(...)
}

export function handleAntibotActiveChanged(event: AntibotActiveChanged): void {
  let token = Token.load(event.params.token);

  if (!token) {
    token = new Token(event.params.token);

    token.tradingStart = BigInt.fromI32(0);
    token.maxTransferAmount = BigInt.fromI32(0);
  }

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

export function handleMarkedBlacklisted(event: MarkedBlacklisted): void {}

export function handleMarkedProtected(event: MarkedProtected): void {}

export function handleMarkedUnthrottled(event: MarkedUnthrottled): void {}

export function handleMarkedWhitelisted(event: MarkedWhitelisted): void {}

export function handleMaxTransferAmountChanged(
  event: MaxTransferAmountChanged
): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTradingStartChanged(event: TradingStartChanged): void {}

export function handleUpgraded(event: Upgraded): void {}
