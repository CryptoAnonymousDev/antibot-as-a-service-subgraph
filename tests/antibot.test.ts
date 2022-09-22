import { 
    afterEach, 
    assert, 
    clearStore, 
    describe, 
    test 
} from "matchstick-as/assembly/index"
import { 
    TOKEN_ENTITY_TYPE, 
    USER_ENTITY_TYPE, 
    OWNER_ENTITY_TYPE,
    BLACKLISTED_ACCOUNT_ENTITY_TYPE,
    PROTECTED_ACCOUNT_ENTITY_TYPE,
    UNTHROTTLED_ACCOUNT_ENTITY_TYPE,
    WHITELISTED_ACCOUNT_ENTITY_TYPE
} from "./constants/constants";
import { 
    handleAntibotActiveChanged,
    handleAuthorityChanged,
    handleMarkedBlacklisted,
    handleMarkedProtected,
    handleMarkedUnthrottled,
    handleMarkedWhitelisted,
    handleMaxTransferAmountChanged,
    handleTradingStartChanged
} from "../src/antibot";
import { createTradingStartChangedEvent } from "./utils/createTradingStartChangedEvent";
import { createAntibotActiveChangedEvent } from "./utils/createAntibotActiveChangedEvent";
import { createAuthorityChangedEvent } from "./utils/createAuthorityChangedEvent";
import { createMarkedBlacklistedEvent } from "./utils/createMarkedBlacklistedEvent";
import { createMarkedProtectedEvent } from "./utils/createMarkedProtectedEvent";
import { createMarkedUnthrottledEvent } from "./utils/createMarkedUnthrottledEvent";
import { createMarkedWhitelistedEvent } from "./utils/createMarkedWhitelistedEvent";
import { createMaxTransferAmountChangedEvent } from "./utils/createMaxTransferAmountChangedEvent";
import { 
    Owner, 
    Token, 
    User, 
    BlacklistedAccount, 
    UnthrottledAccount,
    ProtectedAccount,
    WhitelistedAccount
} from "../generated/schema";
import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { TOKEN } from "./entities/Token";
import { USER } from "./entities/User";
import { OWNER } from "./entities/Owner";
import { UNTHROTTLED_ACCOUNT } from "./entities/UnthrottledAccount";
import { BLACKLISTED_ACCOUNT } from "./entities/BlacklistedAccount";
import { PROTECTED_ACCOUNT } from "./entities/ProtectedAccount";
import { WHITELISTED_ACCOUNT } from "./entities/WhitelistedAccount";

describe("'AntibotActiveChanged' event tests", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should create 'Token' entity when doesn't exist and set antibot as active", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const ACTIVATE = true;

        const antibotActiveChangedEvent = createAntibotActiveChangedEvent(TOKEN_ADDRESS, ACTIVATE);

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);

        handleAntibotActiveChanged(antibotActiveChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, true);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
    });

    test("Should create 'Token' entity when doesn't exist and set antibot as inactive", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const ACTIVATE = false;

        const antibotActiveChangedEvent = createAntibotActiveChangedEvent(TOKEN_ADDRESS, ACTIVATE);

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);

        handleAntibotActiveChanged(antibotActiveChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
    });

    test("Should not create 'Token' entity when exists and set antibot as active", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const ACTIVATE = true;

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const antibotActiveChangedEvent = createAntibotActiveChangedEvent(TOKEN_ADDRESS, ACTIVATE);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        handleAntibotActiveChanged(antibotActiveChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, true);
        assert.bigIntEquals(createdToken.tradingStart!, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount!, BigInt.zero());
    });

    test("Should not create 'Token' entity when exists and set antibot as inactive", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const ACTIVATE = false;

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = true;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const antibotActiveChangedEvent = createAntibotActiveChangedEvent(TOKEN_ADDRESS, ACTIVATE);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        handleAntibotActiveChanged(antibotActiveChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart!, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount!, BigInt.zero());
    });
});

describe("'AuthorityChanged' event tests", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should create correctly 'Token', 'User' and 'Owner' entities when neither of these entities exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const AUTHORIZED_TRUE: boolean = true;
    
        const OWNER_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const authorityChangedEvent = createAuthorityChangedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            AUTHORIZED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(OWNER_ENTITY_TYPE, 0);

        handleAuthorityChanged(authorityChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(OWNER_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        assert.fieldEquals(OWNER_ENTITY_TYPE, OWNER_ID, OWNER.id, OWNER_ID);

        const createdOwner = Owner.load(Bytes.fromHexString(OWNER_ID))!;

        assert.bytesEquals(createdOwner.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdOwner.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'Token' entity when already exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const AUTHORIZED_TRUE: boolean = true;
    
        const OWNER_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const authorityChangedEvent = createAuthorityChangedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            AUTHORIZED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(OWNER_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        handleAuthorityChanged(authorityChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(OWNER_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        assert.fieldEquals(OWNER_ENTITY_TYPE, OWNER_ID, OWNER.id, OWNER_ID);

        const createdOwner = Owner.load(Bytes.fromHexString(OWNER_ID))!;

        assert.bytesEquals(createdOwner.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdOwner.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'User' entity when already exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const AUTHORIZED_TRUE: boolean = true;
    
        const OWNER_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const authorityChangedEvent = createAuthorityChangedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            AUTHORIZED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(OWNER_ENTITY_TYPE, 0);

        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        handleAuthorityChanged(authorityChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(OWNER_ENTITY_TYPE, 1);

        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        assert.fieldEquals(OWNER_ENTITY_TYPE, OWNER_ID, OWNER.id, OWNER_ID);

        const createdOwner = Owner.load(Bytes.fromHexString(OWNER_ID))!;

        assert.bytesEquals(createdOwner.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdOwner.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'Owner' entity when already exists and authorized is set to 'true' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const AUTHORIZED_TRUE: boolean = true;
    
        const OWNER_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const owner = new Owner(Bytes.fromHexString(OWNER_ID));
        owner.token = Bytes.fromHexString(TOKEN_ADDRESS);
        owner.user = Bytes.fromHexString(USER_ADDRESS);

        owner.save();

        const authorityChangedEvent = createAuthorityChangedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            AUTHORIZED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(OWNER_ENTITY_TYPE, 1);

        assert.fieldEquals(OWNER_ENTITY_TYPE, OWNER_ID, OWNER.id, OWNER_ID);

        handleAuthorityChanged(authorityChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(OWNER_ENTITY_TYPE, 1);

        assert.fieldEquals(OWNER_ENTITY_TYPE, OWNER_ID, OWNER.id, OWNER_ID);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const createdOwner = Owner.load(Bytes.fromHexString(OWNER_ID))!;

        assert.bytesEquals(createdOwner.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdOwner.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should remove 'Owner' entity when exists and authorized is set to 'false' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const AUTHORIZED_FALSE: boolean = false;
    
        const OWNER_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const owner = new Owner(Bytes.fromHexString(OWNER_ID));
        owner.token = Bytes.fromHexString(TOKEN_ADDRESS);
        owner.user = Bytes.fromHexString(USER_ADDRESS);

        owner.save();

        const authorityChangedEvent = createAuthorityChangedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            AUTHORIZED_FALSE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(OWNER_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);
        assert.fieldEquals(OWNER_ENTITY_TYPE, OWNER_ID, OWNER.id, OWNER_ID);

        handleAuthorityChanged(authorityChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(OWNER_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        const removedOwner = Owner.load(Bytes.fromHexString(OWNER_ID));

        assert.assertNull(removedOwner);
    });

    test("Should not remove 'Owner' entity when doesn't exist and authorized is set to 'false' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const AUTHORIZED_FALSE: boolean = false;
    
        const OWNER_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const authorityChangedEvent = createAuthorityChangedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            AUTHORIZED_FALSE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(OWNER_ENTITY_TYPE, 0);

        const preEventOwner = Owner.load(Bytes.fromHexString(OWNER_ID));

        assert.assertNull(preEventOwner);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        handleAuthorityChanged(authorityChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(OWNER_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        const postEventOwner = Owner.load(Bytes.fromHexString(OWNER_ID));

        assert.assertNull(postEventOwner);
    });
});

describe("'MarkedBlacklisted' event tests", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should create correctly 'Token', 'User' and 'BlacklistedAccount' entities when neither of these entities exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_BLACKLISTED_TRUE: boolean = true;
    
        const BLACKLISTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const markedBlacklistedEvent = createMarkedBlacklistedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_BLACKLISTED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(BLACKLISTED_ACCOUNT_ENTITY_TYPE, 0);

        handleMarkedBlacklisted(markedBlacklistedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(BLACKLISTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        assert.fieldEquals(BLACKLISTED_ACCOUNT_ENTITY_TYPE, BLACKLISTED_ACCOUNT_ID, BLACKLISTED_ACCOUNT.id, BLACKLISTED_ACCOUNT_ID);

        const createdBlacklistedAccount = BlacklistedAccount.load(Bytes.fromHexString(BLACKLISTED_ACCOUNT_ID))!;

        assert.bytesEquals(createdBlacklistedAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdBlacklistedAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'Token' entity when already exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_BLACKLISTED_TRUE: boolean = true;
    
        const BLACKLISTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const markedBlacklistedEvent = createMarkedBlacklistedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_BLACKLISTED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(BLACKLISTED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        handleMarkedBlacklisted(markedBlacklistedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(BLACKLISTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        assert.fieldEquals(BLACKLISTED_ACCOUNT_ENTITY_TYPE, BLACKLISTED_ACCOUNT_ID, BLACKLISTED_ACCOUNT.id, BLACKLISTED_ACCOUNT_ID);

        const createdBlacklistedAccount = BlacklistedAccount.load(Bytes.fromHexString(BLACKLISTED_ACCOUNT_ID))!;

        assert.bytesEquals(createdBlacklistedAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdBlacklistedAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'User' entity when already exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_BLACKLISTED_TRUE: boolean = true;
    
        const BLACKLISTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const markedBlacklistedEvent = createMarkedBlacklistedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_BLACKLISTED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(BLACKLISTED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        handleMarkedBlacklisted(markedBlacklistedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(BLACKLISTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        assert.fieldEquals(BLACKLISTED_ACCOUNT_ENTITY_TYPE, BLACKLISTED_ACCOUNT_ID, BLACKLISTED_ACCOUNT.id, BLACKLISTED_ACCOUNT_ID);

        const createdBlacklistedAccount = BlacklistedAccount.load(Bytes.fromHexString(BLACKLISTED_ACCOUNT_ID))!;

        assert.bytesEquals(createdBlacklistedAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdBlacklistedAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'BlacklistedAccount' entity when already exists and authorized is set to 'true' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_BLACKLISTED_TRUE: boolean = true;
    
        const BLACKLISTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const blacklistedAccount = new BlacklistedAccount(Bytes.fromHexString(BLACKLISTED_ACCOUNT_ID));
        blacklistedAccount.token = Bytes.fromHexString(TOKEN_ADDRESS);
        blacklistedAccount.user = Bytes.fromHexString(USER_ADDRESS);

        blacklistedAccount.save();

        const markedBlacklistedEvent = createMarkedBlacklistedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_BLACKLISTED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(BLACKLISTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(BLACKLISTED_ACCOUNT_ENTITY_TYPE, BLACKLISTED_ACCOUNT_ID, BLACKLISTED_ACCOUNT.id, BLACKLISTED_ACCOUNT_ID);

        handleMarkedBlacklisted(markedBlacklistedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(BLACKLISTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(BLACKLISTED_ACCOUNT_ENTITY_TYPE, BLACKLISTED_ACCOUNT_ID, BLACKLISTED_ACCOUNT.id, BLACKLISTED_ACCOUNT_ID);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const existedBlacklistedAccount = BlacklistedAccount.load(Bytes.fromHexString(BLACKLISTED_ACCOUNT_ID))!;

        assert.bytesEquals(existedBlacklistedAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(existedBlacklistedAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should remove 'BlacklistedAccount' entity when exists and authorized is set to 'false' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_BLACKLISTED_FALSE: boolean = false;
    
        const BLACKLISTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const blacklistedAccount = new BlacklistedAccount(Bytes.fromHexString(BLACKLISTED_ACCOUNT_ID));
        blacklistedAccount.token = Bytes.fromHexString(TOKEN_ADDRESS);
        blacklistedAccount.user = Bytes.fromHexString(USER_ADDRESS);

        blacklistedAccount.save();

        const markedBlacklistedEvent = createMarkedBlacklistedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_BLACKLISTED_FALSE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(BLACKLISTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);
        assert.fieldEquals(BLACKLISTED_ACCOUNT_ENTITY_TYPE, BLACKLISTED_ACCOUNT_ID, BLACKLISTED_ACCOUNT.id, BLACKLISTED_ACCOUNT_ID);

        handleMarkedBlacklisted(markedBlacklistedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(BLACKLISTED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        const removedBlacklistedAccount = BlacklistedAccount.load(Bytes.fromHexString(BLACKLISTED_ACCOUNT_ID));

        assert.assertNull(removedBlacklistedAccount);
    });

    test("Should not remove 'BlacklistedAccount' entity when doesn't exist and authorized is set to 'false' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_BLACKLISTED_FALSE: boolean = false;
    
        const BLACKLISTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const markedBlacklistedEvent = createMarkedBlacklistedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_BLACKLISTED_FALSE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(BLACKLISTED_ACCOUNT_ENTITY_TYPE, 0);

        const preEventBlacklistedAccount = BlacklistedAccount.load(Bytes.fromHexString(BLACKLISTED_ACCOUNT_ID));

        assert.assertNull(preEventBlacklistedAccount);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        handleMarkedBlacklisted(markedBlacklistedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(BLACKLISTED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        const postEventBlacklistedAccount = BlacklistedAccount.load(Bytes.fromHexString(BLACKLISTED_ACCOUNT_ID));

        assert.assertNull(postEventBlacklistedAccount);
    });
});

describe("'MarkedProtected' event tests", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should create correctly 'Token', 'User' and 'ProtectedAccount' entities when neither of these entities exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_PROTECTED_TRUE: boolean = true;
    
        const PROTECTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const markedProtectedEvent = createMarkedProtectedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_PROTECTED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(PROTECTED_ACCOUNT_ENTITY_TYPE, 0);

        handleMarkedProtected(markedProtectedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(PROTECTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        assert.fieldEquals(PROTECTED_ACCOUNT_ENTITY_TYPE, PROTECTED_ACCOUNT_ID, PROTECTED_ACCOUNT.id, PROTECTED_ACCOUNT_ID);

        const createdProtectedAccount = ProtectedAccount.load(Bytes.fromHexString(PROTECTED_ACCOUNT_ID))!;

        assert.bytesEquals(createdProtectedAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdProtectedAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'Token' entity when already exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_PROTECTED_TRUE: boolean = true;
    
        const PROTECTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const markedProtectedEvent = createMarkedProtectedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_PROTECTED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(PROTECTED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        handleMarkedProtected(markedProtectedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(PROTECTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        assert.fieldEquals(PROTECTED_ACCOUNT_ENTITY_TYPE, PROTECTED_ACCOUNT_ID, PROTECTED_ACCOUNT.id, PROTECTED_ACCOUNT_ID);

        const createdProtectedAccount = ProtectedAccount.load(Bytes.fromHexString(PROTECTED_ACCOUNT_ID))!;

        assert.bytesEquals(createdProtectedAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdProtectedAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'User' entity when already exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_PROTECTED_TRUE: boolean = true;
    
        const PROTECTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const markedProtectedEvent = createMarkedProtectedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_PROTECTED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(PROTECTED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        handleMarkedProtected(markedProtectedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(PROTECTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        assert.fieldEquals(PROTECTED_ACCOUNT_ENTITY_TYPE, PROTECTED_ACCOUNT_ID, PROTECTED_ACCOUNT.id, PROTECTED_ACCOUNT_ID);

        const createdProtectedAccount = ProtectedAccount.load(Bytes.fromHexString(PROTECTED_ACCOUNT_ID))!;

        assert.bytesEquals(createdProtectedAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdProtectedAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'ProtectedAccount' entity when already exists and authorized is set to 'true' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_PROTECTED_TRUE: boolean = true;
    
        const PROTECTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const protectedAccount = new ProtectedAccount(Bytes.fromHexString(PROTECTED_ACCOUNT_ID));
        protectedAccount.token = Bytes.fromHexString(TOKEN_ADDRESS);
        protectedAccount.user = Bytes.fromHexString(USER_ADDRESS);

        protectedAccount.save();

        const markedProtectedEvent = createMarkedProtectedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_PROTECTED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(PROTECTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(PROTECTED_ACCOUNT_ENTITY_TYPE, PROTECTED_ACCOUNT_ID, PROTECTED_ACCOUNT.id, PROTECTED_ACCOUNT_ID);

        handleMarkedProtected(markedProtectedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(PROTECTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(PROTECTED_ACCOUNT_ENTITY_TYPE, PROTECTED_ACCOUNT_ID, PROTECTED_ACCOUNT.id, PROTECTED_ACCOUNT_ID);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const existedProtectedAccount = ProtectedAccount.load(Bytes.fromHexString(PROTECTED_ACCOUNT_ID))!;

        assert.bytesEquals(existedProtectedAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(existedProtectedAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should remove 'ProtectedAccount' entity when exists and authorized is set to 'false' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_PROTECTED_FALSE: boolean = false;
    
        const PROTECTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const protectedAccount = new ProtectedAccount(Bytes.fromHexString(PROTECTED_ACCOUNT_ID));
        protectedAccount.token = Bytes.fromHexString(TOKEN_ADDRESS);
        protectedAccount.user = Bytes.fromHexString(USER_ADDRESS);

        protectedAccount.save();

        const markedProtectedEvent = createMarkedProtectedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_PROTECTED_FALSE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(PROTECTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);
        assert.fieldEquals(PROTECTED_ACCOUNT_ENTITY_TYPE, PROTECTED_ACCOUNT_ID, PROTECTED_ACCOUNT.id, PROTECTED_ACCOUNT_ID);

        handleMarkedProtected(markedProtectedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(PROTECTED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        const removedProtectedAccount = ProtectedAccount.load(Bytes.fromHexString(PROTECTED_ACCOUNT_ID));

        assert.assertNull(removedProtectedAccount);
    });

    test("Should not remove 'ProtectedAccount' entity when doesn't exist and authorized is set to 'false' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_PROTECTED_FALSE: boolean = false;
    
        const PROTECTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const markedProtectedEvent = createMarkedProtectedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_PROTECTED_FALSE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(PROTECTED_ACCOUNT_ENTITY_TYPE, 0);

        const preEventProtectedAccount = ProtectedAccount.load(Bytes.fromHexString(PROTECTED_ACCOUNT_ID));

        assert.assertNull(preEventProtectedAccount);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        handleMarkedProtected(markedProtectedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(PROTECTED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        const postEventProtectedAccount = ProtectedAccount.load(Bytes.fromHexString(PROTECTED_ACCOUNT_ID));

        assert.assertNull(postEventProtectedAccount);
    });
});

describe("'MarkedUnthrottled' event tests", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should create correctly 'Token', 'User' and 'UnthrottledAccount' entities when neither of these entities exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_UNTHROTTLED_TRUE: boolean = true;
    
        const UNTHROTTLED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const markedUnthrottledEvent = createMarkedUnthrottledEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_UNTHROTTLED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, 0);

        handleMarkedUnthrottled(markedUnthrottledEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        assert.fieldEquals(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, UNTHROTTLED_ACCOUNT_ID, UNTHROTTLED_ACCOUNT.id, UNTHROTTLED_ACCOUNT_ID);

        const createdUnthrottledAccount = UnthrottledAccount.load(Bytes.fromHexString(UNTHROTTLED_ACCOUNT_ID))!;

        assert.bytesEquals(createdUnthrottledAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdUnthrottledAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'Token' entity when already exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_UNTHROTTLED_TRUE: boolean = true;
    
        const UNTHROTTLED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const markedUnthrottledEvent = createMarkedUnthrottledEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_UNTHROTTLED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        handleMarkedUnthrottled(markedUnthrottledEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        assert.fieldEquals(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, UNTHROTTLED_ACCOUNT_ID, UNTHROTTLED_ACCOUNT.id, UNTHROTTLED_ACCOUNT_ID);

        const createdUnthrottledAccount = UnthrottledAccount.load(Bytes.fromHexString(UNTHROTTLED_ACCOUNT_ID))!;

        assert.bytesEquals(createdUnthrottledAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdUnthrottledAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'User' entity when already exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_UNTHROTTLED_TRUE: boolean = true;
    
        const UNTHROTTLED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const markedUnthrottledEvent = createMarkedUnthrottledEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_UNTHROTTLED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        handleMarkedUnthrottled(markedUnthrottledEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        assert.fieldEquals(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, UNTHROTTLED_ACCOUNT_ID, UNTHROTTLED_ACCOUNT.id, UNTHROTTLED_ACCOUNT_ID);

        const createdUnthrottledAccount = UnthrottledAccount.load(Bytes.fromHexString(UNTHROTTLED_ACCOUNT_ID))!;

        assert.bytesEquals(createdUnthrottledAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdUnthrottledAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'UnthrottledAccount' entity when already exists and authorized is set to 'true' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_UNTHROTTLED_TRUE: boolean = true;
    
        const UNTHROTTLED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const unthrottledAccount = new UnthrottledAccount(Bytes.fromHexString(UNTHROTTLED_ACCOUNT_ID));
        unthrottledAccount.token = Bytes.fromHexString(TOKEN_ADDRESS);
        unthrottledAccount.user = Bytes.fromHexString(USER_ADDRESS);

        unthrottledAccount.save();

        const markedUnthrottledEvent = createMarkedUnthrottledEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_UNTHROTTLED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, UNTHROTTLED_ACCOUNT_ID, UNTHROTTLED_ACCOUNT.id, UNTHROTTLED_ACCOUNT_ID);

        handleMarkedUnthrottled(markedUnthrottledEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, UNTHROTTLED_ACCOUNT_ID, UNTHROTTLED_ACCOUNT.id, UNTHROTTLED_ACCOUNT_ID);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const existedUnthrottledAccount = UnthrottledAccount.load(Bytes.fromHexString(UNTHROTTLED_ACCOUNT_ID))!;

        assert.bytesEquals(existedUnthrottledAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(existedUnthrottledAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should remove 'UnthrottledAccount' entity when exists and authorized is set to 'false' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_UNTHROTTLED_FALSE: boolean = false;
    
        const UNTHROTTLED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const unthrottledAccount = new UnthrottledAccount(Bytes.fromHexString(UNTHROTTLED_ACCOUNT_ID));
        unthrottledAccount.token = Bytes.fromHexString(TOKEN_ADDRESS);
        unthrottledAccount.user = Bytes.fromHexString(USER_ADDRESS);

        unthrottledAccount.save();

        const markedUnthrottledEvent = createMarkedUnthrottledEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_UNTHROTTLED_FALSE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);
        assert.fieldEquals(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, UNTHROTTLED_ACCOUNT_ID, UNTHROTTLED_ACCOUNT.id, UNTHROTTLED_ACCOUNT_ID);

        handleMarkedUnthrottled(markedUnthrottledEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        const removedUnthrottledAccount = UnthrottledAccount.load(Bytes.fromHexString(UNTHROTTLED_ACCOUNT_ID));

        assert.assertNull(removedUnthrottledAccount);
    });

    test("Should not remove 'UnthrottledAccount' entity when doesn't exist and authorized is set to 'false' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_UNTHROTTLED_FALSE: boolean = false;
    
        const UNTHROTTLED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const markedUnthrottledEvent = createMarkedUnthrottledEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_UNTHROTTLED_FALSE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, 0);

        const preEventUnthrottledAccount = UnthrottledAccount.load(Bytes.fromHexString(UNTHROTTLED_ACCOUNT_ID));

        assert.assertNull(preEventUnthrottledAccount);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        handleMarkedUnthrottled(markedUnthrottledEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(UNTHROTTLED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        const postEventUnthrottledAccount = UnthrottledAccount.load(Bytes.fromHexString(UNTHROTTLED_ACCOUNT_ID));

        assert.assertNull(postEventUnthrottledAccount);
    });
});

describe("'MarkedWhitelisted' event tests", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should create correctly 'Token', 'User' and 'WhitelistedAccount' entities when neither of these entities exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_WHITELISTED_TRUE: boolean = true;
    
        const WHITELISTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const markedWhitelistedEvent = createMarkedWhitelistedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_WHITELISTED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(WHITELISTED_ACCOUNT_ENTITY_TYPE, 0);

        handleMarkedWhitelisted(markedWhitelistedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(WHITELISTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        assert.fieldEquals(WHITELISTED_ACCOUNT_ENTITY_TYPE, WHITELISTED_ACCOUNT_ID, WHITELISTED_ACCOUNT.id, WHITELISTED_ACCOUNT_ID);

        const createdWhitelistedAccount = WhitelistedAccount.load(Bytes.fromHexString(WHITELISTED_ACCOUNT_ID))!;

        assert.bytesEquals(createdWhitelistedAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdWhitelistedAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'Token' entity when already exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_WHITELISTED_TRUE: boolean = true;
    
        const WHITELISTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const markedWhitelistedEvent = createMarkedWhitelistedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_WHITELISTED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(WHITELISTED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        handleMarkedWhitelisted(markedWhitelistedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(WHITELISTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        assert.fieldEquals(WHITELISTED_ACCOUNT_ENTITY_TYPE, WHITELISTED_ACCOUNT_ID, WHITELISTED_ACCOUNT.id, WHITELISTED_ACCOUNT_ID);

        const createdWhitelistedAccount = WhitelistedAccount.load(Bytes.fromHexString(WHITELISTED_ACCOUNT_ID))!;

        assert.bytesEquals(createdWhitelistedAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdWhitelistedAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'User' entity when already exists", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_WHITELISTED_TRUE: boolean = true;
    
        const WHITELISTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const markedWhitelistedEvent = createMarkedWhitelistedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_WHITELISTED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(WHITELISTED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        handleMarkedWhitelisted(markedWhitelistedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(WHITELISTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        assert.fieldEquals(WHITELISTED_ACCOUNT_ENTITY_TYPE, WHITELISTED_ACCOUNT_ID, WHITELISTED_ACCOUNT.id, WHITELISTED_ACCOUNT_ID);

        const createdWhitelistedAccount = WhitelistedAccount.load(Bytes.fromHexString(WHITELISTED_ACCOUNT_ID))!;

        assert.bytesEquals(createdWhitelistedAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(createdWhitelistedAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should not create 'WhitelistedAccount' entity when already exists and authorized is set to 'true' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_WHITELISTED_TRUE: boolean = true;
    
        const WHITELISTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const whitelistedAccount = new WhitelistedAccount(Bytes.fromHexString(WHITELISTED_ACCOUNT_ID));
        whitelistedAccount.token = Bytes.fromHexString(TOKEN_ADDRESS);
        whitelistedAccount.user = Bytes.fromHexString(USER_ADDRESS);

        whitelistedAccount.save();

        const markedWhitelistedEvent = createMarkedWhitelistedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_WHITELISTED_TRUE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);
        assert.entityCount(USER_ENTITY_TYPE, 0);
        assert.entityCount(WHITELISTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(WHITELISTED_ACCOUNT_ENTITY_TYPE, WHITELISTED_ACCOUNT_ID, WHITELISTED_ACCOUNT.id, WHITELISTED_ACCOUNT_ID);

        handleMarkedWhitelisted(markedWhitelistedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(WHITELISTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(WHITELISTED_ACCOUNT_ENTITY_TYPE, WHITELISTED_ACCOUNT_ID, WHITELISTED_ACCOUNT.id, WHITELISTED_ACCOUNT_ID);
        
        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
        
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const existedWhitelistedAccount = WhitelistedAccount.load(Bytes.fromHexString(WHITELISTED_ACCOUNT_ID))!;

        assert.bytesEquals(existedWhitelistedAccount.token, Bytes.fromHexString(TOKEN_ADDRESS));
        assert.bytesEquals(existedWhitelistedAccount.user, Bytes.fromHexString(USER_ADDRESS));
    });

    test("Should remove 'WhitelistedAccount' entity when exists and authorized is set to 'false' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_WHITELISTED_FALSE: boolean = false;
    
        const WHITELISTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const whitelistedAccount = new WhitelistedAccount(Bytes.fromHexString(WHITELISTED_ACCOUNT_ID));
        whitelistedAccount.token = Bytes.fromHexString(TOKEN_ADDRESS);
        whitelistedAccount.user = Bytes.fromHexString(USER_ADDRESS);

        whitelistedAccount.save();

        const markedWhitelistedEvent = createMarkedWhitelistedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_WHITELISTED_FALSE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(WHITELISTED_ACCOUNT_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);
        assert.fieldEquals(WHITELISTED_ACCOUNT_ENTITY_TYPE, WHITELISTED_ACCOUNT_ID, WHITELISTED_ACCOUNT.id, WHITELISTED_ACCOUNT_ID);

        handleMarkedWhitelisted(markedWhitelistedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(WHITELISTED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        const removedWhitelistedAccount = WhitelistedAccount.load(Bytes.fromHexString(WHITELISTED_ACCOUNT_ID));

        assert.assertNull(removedWhitelistedAccount);
    });

    test("Should not remove 'WhitelistedAccount' entity when doesn't exist and authorized is set to 'false' in the event", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const USER_ADDRESS: string = '0xBe8210B30b315894f2675E6876BC44a158045CB1'.toLowerCase();
        const IS_WHITELISTED_FALSE: boolean = false;
    
        const WHITELISTED_ACCOUNT_ID = TOKEN_ADDRESS.concat(USER_ADDRESS.substring(2));

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const user = new User(Bytes.fromHexString(USER_ADDRESS));

        user.save();

        const markedWhitelistedEvent = createMarkedWhitelistedEvent(
            TOKEN_ADDRESS,
            USER_ADDRESS,
            IS_WHITELISTED_FALSE
        );

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(WHITELISTED_ACCOUNT_ENTITY_TYPE, 0);

        const preEventWhitelistedAccount = WhitelistedAccount.load(Bytes.fromHexString(WHITELISTED_ACCOUNT_ID));

        assert.assertNull(preEventWhitelistedAccount);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        handleMarkedWhitelisted(markedWhitelistedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);
        assert.entityCount(USER_ENTITY_TYPE, 1);
        assert.entityCount(WHITELISTED_ACCOUNT_ENTITY_TYPE, 0);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);
        assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, USER.id, USER_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());

        const postEventWhitelistedAccount = WhitelistedAccount.load(Bytes.fromHexString(WHITELISTED_ACCOUNT_ID));

        assert.assertNull(postEventWhitelistedAccount);
    });
});

describe("'MaxTransferAmountChanged' event tests", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should create 'Token' entity when doesn't exist and set max transfer amount to non-zero value", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const MAX_TRANSFER_AMOUNT = BigInt.fromString("10000000000000000000000");

        const antibotActiveChangedEvent = createMaxTransferAmountChangedEvent(TOKEN_ADDRESS, MAX_TRANSFER_AMOUNT);

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);

        handleMaxTransferAmountChanged(antibotActiveChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.fromString("10000000000000000000000"));
    });

    test("Should create 'Token' entity when doesn't exist and set max transfer amount to zero value", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const MAX_TRANSFER_AMOUNT = BigInt.zero();

        const antibotActiveChangedEvent = createMaxTransferAmountChangedEvent(TOKEN_ADDRESS, MAX_TRANSFER_AMOUNT);

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);

        handleMaxTransferAmountChanged(antibotActiveChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
    });

    test("Should not create 'Token' entity when exist and set max transfer amount to non-zero value", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const MAX_TRANSFER_AMOUNT = BigInt.fromString("10000000000000000000000");

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const antibotActiveChangedEvent = createMaxTransferAmountChangedEvent(TOKEN_ADDRESS, MAX_TRANSFER_AMOUNT);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        handleMaxTransferAmountChanged(antibotActiveChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.fromString("10000000000000000000000"));
    });

    test("Should not create 'Token' entity when exist and set max transfer amount to zero value", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const MAX_TRANSFER_AMOUNT = BigInt.zero();

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const antibotActiveChangedEvent = createMaxTransferAmountChangedEvent(TOKEN_ADDRESS, MAX_TRANSFER_AMOUNT);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        handleMaxTransferAmountChanged(antibotActiveChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
    });
});

describe("'TradingStartChanged' event tests", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should create 'Token' entity when doesn't exist and set trading start to non-zero value", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const MAX_TRANSFER_AMOUNT = BigInt.fromString("1663660800");

        const antibotActiveChangedEvent = createTradingStartChangedEvent(TOKEN_ADDRESS, MAX_TRANSFER_AMOUNT);

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);

        handleTradingStartChanged(antibotActiveChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.fromString("1663660800"));
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
    });

    test("Should create 'Token' entity when doesn't exist and set trading start to zero value", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const MAX_TRANSFER_AMOUNT = BigInt.zero();

        const antibotActiveChangedEvent = createTradingStartChangedEvent(TOKEN_ADDRESS, MAX_TRANSFER_AMOUNT);

        assert.entityCount(TOKEN_ENTITY_TYPE, 0);

        handleTradingStartChanged(antibotActiveChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
    });

    test("Should not create 'Token' entity when exist and set trading start to non-zero value", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const MAX_TRANSFER_AMOUNT = BigInt.fromString("1663660800");

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const antibotActiveChangedEvent = createTradingStartChangedEvent(TOKEN_ADDRESS, MAX_TRANSFER_AMOUNT);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        handleTradingStartChanged(antibotActiveChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.fromString("1663660800"));
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
    });

    test("Should not create 'Token' entity when exist and set trading start to zero value", () => {
        const TOKEN_ADDRESS: string = '0xD76b20c53dBf709F4BbfD203321e6F079F4FF2eD'.toLowerCase();
        const MAX_TRANSFER_AMOUNT = BigInt.zero();

        const token = new Token(Bytes.fromHexString(TOKEN_ADDRESS));
        token.antibotActive = false;
        token.tradingStart = BigInt.zero();
        token.maxTransferAmount = BigInt.zero();
        
        token.save();

        const antibotActiveChangedEvent = createTradingStartChangedEvent(TOKEN_ADDRESS, MAX_TRANSFER_AMOUNT);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        handleTradingStartChanged(antibotActiveChangedEvent);

        assert.entityCount(TOKEN_ENTITY_TYPE, 1);

        assert.fieldEquals(TOKEN_ENTITY_TYPE, TOKEN_ADDRESS, TOKEN.id, TOKEN_ADDRESS);

        const createdToken = Token.load(Bytes.fromHexString(TOKEN_ADDRESS))!;

        assert.booleanEquals(createdToken.antibotActive, false);
        assert.bigIntEquals(createdToken.tradingStart, BigInt.zero());
        assert.bigIntEquals(createdToken.maxTransferAmount, BigInt.zero());
    });
});