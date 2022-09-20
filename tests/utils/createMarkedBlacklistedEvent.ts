import { Address, Bytes, ethereum, JSONValue, Value,  } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { MarkedBlacklisted } from "../../generated/Antibot/Antibot";

export function createMarkedBlacklistedEvent(
    token: string,
    user: string,
    blacklisted: boolean
): MarkedBlacklisted {
    let mockEvent = newMockEvent();

    let markedBlacklistedEvent = new MarkedBlacklisted(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        mockEvent.receipt
    );

    markedBlacklistedEvent.parameters = new Array();

    const tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(Address.fromString(token)));
    const accountParam = new ethereum.EventParam('account', ethereum.Value.fromAddress(Address.fromString(user)));
    const blacklistedParam = new ethereum.EventParam('isBlacklisted', ethereum.Value.fromBoolean(blacklisted));
    
    markedBlacklistedEvent.parameters.push(tokenParam);
    markedBlacklistedEvent.parameters.push(accountParam);
    markedBlacklistedEvent.parameters.push(blacklistedParam);

    return markedBlacklistedEvent;
}