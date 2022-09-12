// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Token extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Token entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type Token must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Token", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): Token | null {
    return changetype<Token | null>(store.get("Token", id.toHexString()));
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get antibotActive(): boolean {
    let value = this.get("antibotActive");
    return value!.toBoolean();
  }

  set antibotActive(value: boolean) {
    this.set("antibotActive", Value.fromBoolean(value));
  }

  get tradingStart(): BigInt {
    let value = this.get("tradingStart");
    return value!.toBigInt();
  }

  set tradingStart(value: BigInt) {
    this.set("tradingStart", Value.fromBigInt(value));
  }

  get maxTransferAmount(): BigInt {
    let value = this.get("maxTransferAmount");
    return value!.toBigInt();
  }

  set maxTransferAmount(value: BigInt) {
    this.set("maxTransferAmount", Value.fromBigInt(value));
  }

  get owners(): Array<Bytes> | null {
    let value = this.get("owners");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytesArray();
    }
  }

  set owners(value: Array<Bytes> | null) {
    if (!value) {
      this.unset("owners");
    } else {
      this.set("owners", Value.fromBytesArray(<Array<Bytes>>value));
    }
  }

  get whitelistedAccounts(): Array<Bytes> | null {
    let value = this.get("whitelistedAccounts");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytesArray();
    }
  }

  set whitelistedAccounts(value: Array<Bytes> | null) {
    if (!value) {
      this.unset("whitelistedAccounts");
    } else {
      this.set(
        "whitelistedAccounts",
        Value.fromBytesArray(<Array<Bytes>>value)
      );
    }
  }

  get unthrottledAccounts(): Array<Bytes> | null {
    let value = this.get("unthrottledAccounts");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytesArray();
    }
  }

  set unthrottledAccounts(value: Array<Bytes> | null) {
    if (!value) {
      this.unset("unthrottledAccounts");
    } else {
      this.set(
        "unthrottledAccounts",
        Value.fromBytesArray(<Array<Bytes>>value)
      );
    }
  }

  get protectedAccounts(): Array<Bytes> | null {
    let value = this.get("protectedAccounts");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytesArray();
    }
  }

  set protectedAccounts(value: Array<Bytes> | null) {
    if (!value) {
      this.unset("protectedAccounts");
    } else {
      this.set("protectedAccounts", Value.fromBytesArray(<Array<Bytes>>value));
    }
  }

  get blacklistedAccounts(): Array<Bytes> | null {
    let value = this.get("blacklistedAccounts");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytesArray();
    }
  }

  set blacklistedAccounts(value: Array<Bytes> | null) {
    if (!value) {
      this.unset("blacklistedAccounts");
    } else {
      this.set(
        "blacklistedAccounts",
        Value.fromBytesArray(<Array<Bytes>>value)
      );
    }
  }
}