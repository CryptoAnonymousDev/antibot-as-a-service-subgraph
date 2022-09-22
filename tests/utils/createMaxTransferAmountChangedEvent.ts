import { Address, Bytes, ethereum, JSONValue, Value, BigInt } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { MaxTransferAmountChanged } from "../../generated/Antibot/Antibot";

export function createMaxTransferAmountChangedEvent(
    token: string,
    maxTransferAmount: BigInt
): MaxTransferAmountChanged {
    let mockEvent = newMockEvent();

    let maxTransferAmountChangedEvent = new MaxTransferAmountChanged(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        mockEvent.receipt
    );

    maxTransferAmountChangedEvent.parameters = new Array();

    const tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(Address.fromString(token)));
    const maxTransferAmountParam = new ethereum.EventParam('maxTransferAmount', ethereum.Value.fromUnsignedBigInt(maxTransferAmount));
    
    maxTransferAmountChangedEvent.parameters.push(tokenParam);
    maxTransferAmountChangedEvent.parameters.push(maxTransferAmountParam);

    return maxTransferAmountChangedEvent;
}