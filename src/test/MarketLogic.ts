// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it

import { assert } from 'chai';
import * as fs from 'fs';
import 'mocha';
import Web3 from 'web3';
import { migrateUserRegistryContracts, UserLogic, UserContractLookup } from 'ew-user-registry-contracts';
import { migrateSonnenAssetRegistryContracts, AssetContractLookup, SonnenProducingAssetLogic } from 'ew-asset-registry-contracts-sonnen';
import { migrateMarketRegistryContracts } from '../utils/migrateContracts';
import { MarketContractLookup } from '../wrappedContracts/MarketContractLookup';
import { MarketDB } from '../wrappedContracts/MarketDB';
import { MarketLogic } from '../wrappedContracts/MarketLogic';
import { MarketContractLookupJSON, MarketLogicJSON, MarketDBJSON } from '..';
describe('MarketLogic', () => {

    const configFile = JSON.parse(fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8'));

    const web3 = new Web3(configFile.develop.web3);

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x') ?
        configFile.develop.deployKey : '0x' + configFile.develop.deployKey;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    let assetRegistryContract: AssetContractLookup;
    let marketRegistryContract: MarketContractLookup;
    let marketDB: MarketDB;
    let marketLogic: MarketLogic;
    let isGanache: boolean;
    let userContractLookupAddr;
    let userLogic: UserLogic;
    let assetRegistry: SonnenProducingAssetLogic;

    const assetOwnerPK = '0xc118b0425221384fe0cbbd093b2a81b1b65d0330810e0792c7059e518cea5383';
    const accountAssetOwner = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const traderPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    const matcherPK = '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c';
    const matcherAccount = web3.eth.accounts.privateKeyToAccount(matcherPK).address;

    const assetSmartmeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const assetSmartmeter = web3.eth.accounts.privateKeyToAccount(assetSmartmeterPK).address;
    const assetSmartmeter2PK = '0x554f3c1470e9f66ed2cf1dc260d2f4de77a816af2883679b1dc68c551e8fa5ed';
    const assetSmartMeter2 = web3.eth.accounts.privateKeyToAccount(assetSmartmeter2PK).address;

    it('should deploy the contracts', async () => {

        isGanache = true;
        const userContracts = await migrateUserRegistryContracts(web3, privateKeyDeployment);

        userLogic = new UserLogic((web3 as any), (userContracts as any).UserLogic);
        await userLogic.setUser(accountDeployment, 'admin', { privateKey: privateKeyDeployment });

        await userLogic.setRoles(accountDeployment, 3, { privateKey: privateKeyDeployment });

        userContractLookupAddr = (userContracts as any).UserContractLookup;

        const assetContracts = await migrateSonnenAssetRegistryContracts(web3, userContractLookupAddr, privateKeyDeployment);

        const assetRegistryLookupAddr = (assetContracts as any).AssetContractLookup;

        const marketContracts = await migrateMarketRegistryContracts(web3, assetRegistryLookupAddr, privateKeyDeployment);

        assetRegistryContract = new AssetContractLookup((web3 as any), assetRegistryLookupAddr);
        assetRegistry = new SonnenProducingAssetLogic(web3, (assetContracts as any).AssetProducingRegistryLogic);
        Object.keys(marketContracts).forEach(async (key) => {

            let tempBytecode;
            if (key.includes('MarketContractLookup')) {
                marketRegistryContract = new MarketContractLookup(web3, marketContracts[key]);
                tempBytecode = '0x' + MarketContractLookupJSON.deployedBytecode;
            }

            if (key.includes('MarketLogic')) {
                marketLogic = new MarketLogic(web3, marketContracts[key]);
                tempBytecode = '0x' + MarketLogicJSON.deployedBytecode;
            }

            if (key.includes('MarketDB')) {
                marketDB = new MarketDB(web3, marketContracts[key]);
                tempBytecode = '0x' + MarketDBJSON.deployedBytecode;
            }
            const deployedBytecode = await web3.eth.getCode(marketContracts[key]);
            assert.isTrue(deployedBytecode.length > 0);

            // const tempBytecode = '0x' + contractInfo.deployedBytecode;
            assert.equal(deployedBytecode, tempBytecode);

        });
    });

    it('should have the right owner', async () => {

        assert.equal(await marketLogic.owner(), marketRegistryContract.web3Contract._address);

    });

    it('should have the lookup-contracts', async () => {

        assert.equal(await marketLogic.assetContractLookup(), assetRegistryContract.web3Contract._address);
        assert.equal(await marketLogic.userContractLookup(), userContractLookupAddr);
    });

    it('should have the right db', async () => {

        assert.equal(await marketLogic.db(), marketDB.web3Contract._address);

    });

    it('should set right roles to users', async () => {
        await userLogic.setUser(accountTrader, 'trader', { privateKey: privateKeyDeployment });
        await userLogic.setUser(accountAssetOwner, 'assetOwner', { privateKey: privateKeyDeployment });

        await userLogic.setRoles(accountTrader, 16, { privateKey: privateKeyDeployment });
        await userLogic.setRoles(accountAssetOwner, 8, { privateKey: privateKeyDeployment });
    });

    it('should create a demand', async () => {

        await marketLogic.createDemand('Sachsen', Date.now(), Date.now() + 1000, 1000, { privateKey: traderPK });

        console.log(await marketLogic.getDemand(0));
    });

    it('should onboard an asset', async () => {

        await assetRegistry.createSonnenAsset(
            assetSmartmeter,
            accountAssetOwner,
            true,
            (['0x1000000000000000000000000000000000000005'] as any),
            'propertiesDocumentHash',
            'url',
            2,
            marketRegistryContract.web3Contract._address,
            {
                privateKey: privateKeyDeployment,
            },
        );

    });

    it('should onboard an asset', async () => {

        await assetRegistry.createSonnenAsset(
            assetSmartMeter2,
            accountAssetOwner,
            true,
            (['0x1000000000000000000000000000000000000005'] as any),
            'propertiesDocumentHash',
            'url',
            2,
            marketRegistryContract.web3Contract._address,
            {
                privateKey: privateKeyDeployment,
            },
        );

    });

    it('should create a supply', async () => {
        await marketLogic.createSupply(0, 'Sachsen', Date.now(), Date.now() + 1000, 1000, 10, { privateKey: traderPK });

        console.log(await marketLogic.getSupply(0));

    });

    it('should create a 2nd supply', async () => {
        await marketLogic.createSupply(1, 'Sachsen 2', Date.now(), Date.now() + 1000, 1000, 20, { privateKey: traderPK });
        console.log(await marketLogic.getSupply(1));

    });

    it('should create an agreement', async () => {

        await marketLogic.createAgreement(0, 1, { privateKey: traderPK });

        console.log(await marketLogic.getAgreement(0));

    });

});
