import { Address, Bytes, ethereum, JSONValue, Value,  } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { AuthorityChanged } from "../../generated/Antibot/Antibot";

export function createAuthorityChangedEvent(
    token: string,
    user: string,
    authorized: boolean
): AuthorityChanged {
    let mockEvent = newMockEvent();

    let authorityChangedEvent = new AuthorityChanged(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        mockEvent.receipt
    );

    authorityChangedEvent.parameters = new Array();

    const targetParam = new ethereum.EventParam('target', ethereum.Value.fromAddress(Address.fromString(token)));
    const userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(Address.fromString(user)));
    const authorizedParam = new ethereum.EventParam('authorized', ethereum.Value.fromBoolean(authorized));
    
    authorityChangedEvent.parameters.push(targetParam);
    authorityChangedEvent.parameters.push(userParam);
    authorityChangedEvent.parameters.push(authorizedParam);

    return authorityChangedEvent;
}