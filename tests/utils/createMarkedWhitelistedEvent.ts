import { Address, Bytes, ethereum, JSONValue, Value,  } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { MarkedWhitelisted } from "../../generated/Antibot/Antibot";

export function createMarkedWhitelistedEvent(
    token: string,
    user: string,
    whitelisted: boolean
): MarkedWhitelisted {
    let mockEvent = newMockEvent();

    let markedWhitelistedEvent = new MarkedWhitelisted(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        mockEvent.receipt
    );

    markedWhitelistedEvent.parameters = new Array();

    const tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(Address.fromString(token)));
    const accountParam = new ethereum.EventParam('account', ethereum.Value.fromAddress(Address.fromString(user)));
    const whitelistedParam = new ethereum.EventParam('isWhitelisted', ethereum.Value.fromBoolean(whitelisted));
    
    markedWhitelistedEvent.parameters.push(tokenParam);
    markedWhitelistedEvent.parameters.push(accountParam);
    markedWhitelistedEvent.parameters.push(whitelistedParam);

    return markedWhitelistedEvent;
}