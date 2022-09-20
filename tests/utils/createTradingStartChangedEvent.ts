import { Address, Bytes, ethereum, JSONValue, Value, BigInt } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { TradingStartChanged } from "../../generated/Antibot/Antibot";

export function createTradingStartChangedEvent(
    token: string,
    tradingStart: BigInt
): TradingStartChanged {
    let mockEvent = newMockEvent();

    let tradingStartChangedEvent = new TradingStartChanged(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        mockEvent.receipt
    );

    tradingStartChangedEvent.parameters = new Array();

    const tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(Address.fromString(token)));
    const tradingStartParam = new ethereum.EventParam('tradingStart', ethereum.Value.fromUnsignedBigInt(tradingStart));
    
    tradingStartChangedEvent.parameters.push(tokenParam);
    tradingStartChangedEvent.parameters.push(tradingStartParam);

    return tradingStartChangedEvent;
}