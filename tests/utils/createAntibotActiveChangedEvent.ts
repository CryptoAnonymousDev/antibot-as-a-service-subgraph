import { Address, Bytes, ethereum, JSONValue, Value,  } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { AntibotActiveChanged } from "../../generated/Antibot/Antibot";

export function createAntibotActiveChangedEvent(
    token: string,
    active: boolean
): AntibotActiveChanged {
    let mockEvent = newMockEvent();

    let antibotActiveChangedEvent = new AntibotActiveChanged(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        mockEvent.receipt
    );

    antibotActiveChangedEvent.parameters = new Array();

    const tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(Address.fromString(token)));
    const activeParam = new ethereum.EventParam('active', ethereum.Value.fromBoolean(active));
    
    antibotActiveChangedEvent.parameters.push(tokenParam);
    antibotActiveChangedEvent.parameters.push(activeParam);

    return antibotActiveChangedEvent;
}