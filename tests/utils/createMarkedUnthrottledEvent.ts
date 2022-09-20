import { Address, Bytes, ethereum, JSONValue, Value,  } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { MarkedUnthrottled } from "../../generated/Antibot/Antibot";

export function createMarkedUnthrottledEvent(
    token: string,
    user: string,
    unthrottled: boolean
): MarkedUnthrottled {
    let mockEvent = newMockEvent();

    let markedUnthrottledEvent = new MarkedUnthrottled(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        mockEvent.receipt
    );

    markedUnthrottledEvent.parameters = new Array();

    const tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(Address.fromString(token)));
    const accountParam = new ethereum.EventParam('account', ethereum.Value.fromAddress(Address.fromString(user)));
    const unthrottledParam = new ethereum.EventParam('isUnthrottled', ethereum.Value.fromBoolean(unthrottled));
    
    markedUnthrottledEvent.parameters.push(tokenParam);
    markedUnthrottledEvent.parameters.push(accountParam);
    markedUnthrottledEvent.parameters.push(unthrottledParam);

    return markedUnthrottledEvent;
}