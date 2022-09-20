import { Address, Bytes, ethereum, JSONValue, Value,  } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { MarkedProtected } from "../../generated/Antibot/Antibot";

export function createMarkedProtectedEvent(
    token: string,
    user: string,
    protected_: boolean
): MarkedProtected {
    let mockEvent = newMockEvent();

    let markedProtectedEvent = new MarkedProtected(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        mockEvent.receipt
    );

    markedProtectedEvent.parameters = new Array();

    const tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(Address.fromString(token)));
    const accountParam = new ethereum.EventParam('account', ethereum.Value.fromAddress(Address.fromString(user)));
    const protectedParam = new ethereum.EventParam('isProtected', ethereum.Value.fromBoolean(protected_));
    
    markedProtectedEvent.parameters.push(tokenParam);
    markedProtectedEvent.parameters.push(accountParam);
    markedProtectedEvent.parameters.push(protectedParam);

    return markedProtectedEvent;
}