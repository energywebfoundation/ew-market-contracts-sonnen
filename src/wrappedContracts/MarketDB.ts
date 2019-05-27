
    import { GeneralFunctions, SpecialTx, SearchLog, getClientVersion } from './GeneralFunctions'
    import * as fs from 'fs'
    import * as path from 'path'
    import Web3 = require('web3');
    import { Tx, BlockType } from 'web3/eth/types';
    import { TransactionReceipt, Logs } from 'web3/types';
    import { JsonRPCResponse } from 'web3/providers';
    import MarketDBJSON from '../../contract-build/MarketDB.json'

    export class MarketDB extends GeneralFunctions
{
    web3: Web3
    buildFile = MarketDBJSON
    constructor(web3: Web3, address?: string){
        super(address ? new web3.eth.Contract(MarketDBJSON.abi, address) : new web3.eth.Contract(MarketDBJSON.abi, MarketDBJSON.networks.length > 0 ? (MarketDBJSON.networks[0]) : null))
        this.web3 = web3
    }


    async getAllLogChangeOwnerEvents(eventFilter?:SearchLog){
        let filterParams
        if(eventFilter){
            filterParams = {
                fromBlock: eventFilter.fromBlock? eventFilter.fromBlock: 0, 
                toBlock: eventFilter.toBlock? eventFilter.toBlock: 'latest'
            }
            if (eventFilter.topics) {
                filterParams.topics = eventFilter.topics;
            }
        } else {
            filterParams = {
                fromBlock:0,
                toBlock:'latest' 
            }
        }
        return await this.web3Contract.getPastEvents('LogChangeOwner', filterParams)
    }
            
    async getAllEvents(eventFilter?:SearchLog){
        let filterParams
        if(eventFilter){
            filterParams = {
                fromBlock: eventFilter.fromBlock? eventFilter.fromBlock: 0,
                toBlock: eventFilter.toBlock? eventFilter.toBlock: 'latest',
                topics: eventFilter.topics? eventFilter.topics: [null]
            }
        } else {
            filterParams = {
                fromBlock:0,
                toBlock:'latest',
                topics:[null]
            }
        }
        return await this.web3Contract.getPastEvents('allEvents', filterParams)
    }
    	async getAllAgreementListLengthDB(txParams ?: SpecialTx){
		return (await this.web3Contract.methods.getAllAgreementListLengthDB().call(txParams)) 
	}
	async getDemand(_demandId:number, txParams?:SpecialTx){
		return (await this.web3Contract.methods.getDemand(_demandId).call(txParams)) 
	}
	async createSupply(_assetId:number[],_regionId:string,_dateTimeFrom:number,_dateTimeTo:number,_power:number,_matchedPower:number,_price:number, txParams?:SpecialTx){

            let transactionParams

            const txData = await this.web3Contract.methods.createSupply(_assetId,_regionId,_dateTimeFrom,_dateTimeTo,_power,_matchedPower,_price)
            .encodeABI()

            let gas

        

            if(txParams){

                if(txParams.privateKey){
                    const privateKey = txParams.privateKey.startsWith("0x") ? txParams.privateKey : "0x" + txParams.privateKey;
                    txParams.from = this.web3.eth.accounts.privateKeyToAccount(privateKey).address
                    txParams.nonce = txParams.nonce ? txParams.nonce : (await this.web3.eth.getTransactionCount(txParams.from))
                }

                if(!txParams.gas){

                    try{
                    gas = await this.web3Contract.methods.createSupply(_assetId,_regionId,_dateTimeFrom,_dateTimeTo,_power,_matchedPower,_price)
                        .estimateGas({ from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0]} )
                    } catch(ex){

                        if (!(await getClientVersion(this.web3)).includes('Parity')) throw new Error(ex) ;

                        const errorResult = await this.getErrorMessage(this.web3, 
                            {
                            from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0] ,
                            to: this.web3Contract._address,
                            data: txData,
                            gas: this.web3.utils.toHex(7000000)
                            }
                         )
                         throw new Error(errorResult);

                    }
                    gas = Math.round(gas*2)
                    
                    txParams.gas = gas 
                }

                transactionParams = {
                    from: txParams.from ? txParams.from : (await this.web3.eth.getAccounts())[0],
                    gas: txParams.gas ? txParams.gas : Math.round(gas * 1.1 + 21000),
                    gasPrice: 0,
                    nonce: txParams.nonce ? txParams.nonce : (await this.web3.eth.getTransactionCount(txParams.from)),
                    data: txParams.data ? txParams.data : '',
                    to: this.web3Contract._address,
                    privateKey: txParams.privateKey? txParams.privateKey: ""
                }
            }else {
                transactionParams = {from:(await this.web3.eth.getAccounts())[0],
                    gas:  Math.round(gas * 1.1 +21000),
                    gasPrice: 0,
                    nonce:  (await this.web3.eth.getTransactionCount((await this.web3.eth.getAccounts())[0])),
                    data: '',
                    to: this.web3Contract._address,
                    privateKey: ""
                }
            }
            
         
            if (transactionParams.privateKey !== '') {
            
                transactionParams.data = txData
                return (await this.sendRaw(this.web3, transactionParams.privateKey, transactionParams))
            } else {
                return await this.web3Contract.methods.createSupply(_assetId,_regionId,_dateTimeFrom,_dateTimeTo,_power,_matchedPower,_price)
                    .send({from: transactionParams.from, gas: transactionParams.gas}) 
            }
	}
	async getAgreementDB(_agreementId:number, txParams?:SpecialTx){
		return (await this.web3Contract.methods.getAgreementDB(_agreementId).call(txParams)) 
	}
	async setDemandMatchedPower(_demandId:number,_matchedPower:number, txParams?:SpecialTx){

            let transactionParams

            const txData = await this.web3Contract.methods.setDemandMatchedPower(_demandId,_matchedPower)
            .encodeABI()

            let gas

        

            if(txParams){

                if(txParams.privateKey){
                    const privateKey = txParams.privateKey.startsWith("0x") ? txParams.privateKey : "0x" + txParams.privateKey;
                    txParams.from = this.web3.eth.accounts.privateKeyToAccount(privateKey).address
                    txParams.nonce = txParams.nonce ? txParams.nonce : (await this.web3.eth.getTransactionCount(txParams.from))
                }

                if(!txParams.gas){

                    try{
                    gas = await this.web3Contract.methods.setDemandMatchedPower(_demandId,_matchedPower)
                        .estimateGas({ from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0]} )
                    } catch(ex){

                        if (!(await getClientVersion(this.web3)).includes('Parity')) throw new Error(ex) ;

                        const errorResult = await this.getErrorMessage(this.web3, 
                            {
                            from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0] ,
                            to: this.web3Contract._address,
                            data: txData,
                            gas: this.web3.utils.toHex(7000000)
                            }
                         )
                         throw new Error(errorResult);

                    }
                    gas = Math.round(gas*2)
                    
                    txParams.gas = gas 
                }

                transactionParams = {
                    from: txParams.from ? txParams.from : (await this.web3.eth.getAccounts())[0],
                    gas: txParams.gas ? txParams.gas : Math.round(gas * 1.1 + 21000),
                    gasPrice: 0,
                    nonce: txParams.nonce ? txParams.nonce : (await this.web3.eth.getTransactionCount(txParams.from)),
                    data: txParams.data ? txParams.data : '',
                    to: this.web3Contract._address,
                    privateKey: txParams.privateKey? txParams.privateKey: ""
                }
            }else {
                transactionParams = {from:(await this.web3.eth.getAccounts())[0],
                    gas:  Math.round(gas * 1.1 +21000),
                    gasPrice: 0,
                    nonce:  (await this.web3.eth.getTransactionCount((await this.web3.eth.getAccounts())[0])),
                    data: '',
                    to: this.web3Contract._address,
                    privateKey: ""
                }
            }
            
         
            if (transactionParams.privateKey !== '') {
            
                transactionParams.data = txData
                return (await this.sendRaw(this.web3, transactionParams.privateKey, transactionParams))
            } else {
                return await this.web3Contract.methods.setDemandMatchedPower(_demandId,_matchedPower)
                    .send({from: transactionParams.from, gas: transactionParams.gas}) 
            }
	}
	async getAllSupplyListLength(txParams ?: SpecialTx){
		return (await this.web3Contract.methods.getAllSupplyListLength().call(txParams)) 
	}
	async owner(txParams ?: SpecialTx){
		return (await this.web3Contract.methods.owner().call(txParams)) 
	}
	async createAgreementDB(_demandId:number,_supplyId:number[], txParams?:SpecialTx){

            let transactionParams

            const txData = await this.web3Contract.methods.createAgreementDB(_demandId,_supplyId)
            .encodeABI()

            let gas

        

            if(txParams){

                if(txParams.privateKey){
                    const privateKey = txParams.privateKey.startsWith("0x") ? txParams.privateKey : "0x" + txParams.privateKey;
                    txParams.from = this.web3.eth.accounts.privateKeyToAccount(privateKey).address
                    txParams.nonce = txParams.nonce ? txParams.nonce : (await this.web3.eth.getTransactionCount(txParams.from))
                }

                if(!txParams.gas){

                    try{
                    gas = await this.web3Contract.methods.createAgreementDB(_demandId,_supplyId)
                        .estimateGas({ from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0]} )
                    } catch(ex){

                        if (!(await getClientVersion(this.web3)).includes('Parity')) throw new Error(ex) ;

                        const errorResult = await this.getErrorMessage(this.web3, 
                            {
                            from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0] ,
                            to: this.web3Contract._address,
                            data: txData,
                            gas: this.web3.utils.toHex(7000000)
                            }
                         )
                         throw new Error(errorResult);

                    }
                    gas = Math.round(gas*2)
                    
                    txParams.gas = gas 
                }

                transactionParams = {
                    from: txParams.from ? txParams.from : (await this.web3.eth.getAccounts())[0],
                    gas: txParams.gas ? txParams.gas : Math.round(gas * 1.1 + 21000),
                    gasPrice: 0,
                    nonce: txParams.nonce ? txParams.nonce : (await this.web3.eth.getTransactionCount(txParams.from)),
                    data: txParams.data ? txParams.data : '',
                    to: this.web3Contract._address,
                    privateKey: txParams.privateKey? txParams.privateKey: ""
                }
            }else {
                transactionParams = {from:(await this.web3.eth.getAccounts())[0],
                    gas:  Math.round(gas * 1.1 +21000),
                    gasPrice: 0,
                    nonce:  (await this.web3.eth.getTransactionCount((await this.web3.eth.getAccounts())[0])),
                    data: '',
                    to: this.web3Contract._address,
                    privateKey: ""
                }
            }
            
         
            if (transactionParams.privateKey !== '') {
            
                transactionParams.data = txData
                return (await this.sendRaw(this.web3, transactionParams.privateKey, transactionParams))
            } else {
                return await this.web3Contract.methods.createAgreementDB(_demandId,_supplyId)
                    .send({from: transactionParams.from, gas: transactionParams.gas}) 
            }
	}
	async changeOwner(_newOwner:string, txParams?:SpecialTx){

            let transactionParams

            const txData = await this.web3Contract.methods.changeOwner(_newOwner)
            .encodeABI()

            let gas

        

            if(txParams){

                if(txParams.privateKey){
                    const privateKey = txParams.privateKey.startsWith("0x") ? txParams.privateKey : "0x" + txParams.privateKey;
                    txParams.from = this.web3.eth.accounts.privateKeyToAccount(privateKey).address
                    txParams.nonce = txParams.nonce ? txParams.nonce : (await this.web3.eth.getTransactionCount(txParams.from))
                }

                if(!txParams.gas){

                    try{
                    gas = await this.web3Contract.methods.changeOwner(_newOwner)
                        .estimateGas({ from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0]} )
                    } catch(ex){

                        if (!(await getClientVersion(this.web3)).includes('Parity')) throw new Error(ex) ;

                        const errorResult = await this.getErrorMessage(this.web3, 
                            {
                            from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0] ,
                            to: this.web3Contract._address,
                            data: txData,
                            gas: this.web3.utils.toHex(7000000)
                            }
                         )
                         throw new Error(errorResult);

                    }
                    gas = Math.round(gas*2)
                    
                    txParams.gas = gas 
                }

                transactionParams = {
                    from: txParams.from ? txParams.from : (await this.web3.eth.getAccounts())[0],
                    gas: txParams.gas ? txParams.gas : Math.round(gas * 1.1 + 21000),
                    gasPrice: 0,
                    nonce: txParams.nonce ? txParams.nonce : (await this.web3.eth.getTransactionCount(txParams.from)),
                    data: txParams.data ? txParams.data : '',
                    to: this.web3Contract._address,
                    privateKey: txParams.privateKey? txParams.privateKey: ""
                }
            }else {
                transactionParams = {from:(await this.web3.eth.getAccounts())[0],
                    gas:  Math.round(gas * 1.1 +21000),
                    gasPrice: 0,
                    nonce:  (await this.web3.eth.getTransactionCount((await this.web3.eth.getAccounts())[0])),
                    data: '',
                    to: this.web3Contract._address,
                    privateKey: ""
                }
            }
            
         
            if (transactionParams.privateKey !== '') {
            
                transactionParams.data = txData
                return (await this.sendRaw(this.web3, transactionParams.privateKey, transactionParams))
            } else {
                return await this.web3Contract.methods.changeOwner(_newOwner)
                    .send({from: transactionParams.from, gas: transactionParams.gas}) 
            }
	}
	async getAgreementForSupply(_supplyId:number, txParams?:SpecialTx){
		return (await this.web3Contract.methods.getAgreementForSupply(_supplyId).call(txParams)) 
	}
	async createDemand(_regionId:string,_dateTimeFrom:number,_dateTimeTo:number,_power:number,_matchedPower:number, txParams?:SpecialTx){

            let transactionParams

            const txData = await this.web3Contract.methods.createDemand(_regionId,_dateTimeFrom,_dateTimeTo,_power,_matchedPower)
            .encodeABI()

            let gas

        

            if(txParams){

                if(txParams.privateKey){
                    const privateKey = txParams.privateKey.startsWith("0x") ? txParams.privateKey : "0x" + txParams.privateKey;
                    txParams.from = this.web3.eth.accounts.privateKeyToAccount(privateKey).address
                    txParams.nonce = txParams.nonce ? txParams.nonce : (await this.web3.eth.getTransactionCount(txParams.from))
                }

                if(!txParams.gas){

                    try{
                    gas = await this.web3Contract.methods.createDemand(_regionId,_dateTimeFrom,_dateTimeTo,_power,_matchedPower)
                        .estimateGas({ from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0]} )
                    } catch(ex){

                        if (!(await getClientVersion(this.web3)).includes('Parity')) throw new Error(ex) ;

                        const errorResult = await this.getErrorMessage(this.web3, 
                            {
                            from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0] ,
                            to: this.web3Contract._address,
                            data: txData,
                            gas: this.web3.utils.toHex(7000000)
                            }
                         )
                         throw new Error(errorResult);

                    }
                    gas = Math.round(gas*2)
                    
                    txParams.gas = gas 
                }

                transactionParams = {
                    from: txParams.from ? txParams.from : (await this.web3.eth.getAccounts())[0],
                    gas: txParams.gas ? txParams.gas : Math.round(gas * 1.1 + 21000),
                    gasPrice: 0,
                    nonce: txParams.nonce ? txParams.nonce : (await this.web3.eth.getTransactionCount(txParams.from)),
                    data: txParams.data ? txParams.data : '',
                    to: this.web3Contract._address,
                    privateKey: txParams.privateKey? txParams.privateKey: ""
                }
            }else {
                transactionParams = {from:(await this.web3.eth.getAccounts())[0],
                    gas:  Math.round(gas * 1.1 +21000),
                    gasPrice: 0,
                    nonce:  (await this.web3.eth.getTransactionCount((await this.web3.eth.getAccounts())[0])),
                    data: '',
                    to: this.web3Contract._address,
                    privateKey: ""
                }
            }
            
         
            if (transactionParams.privateKey !== '') {
            
                transactionParams.data = txData
                return (await this.sendRaw(this.web3, transactionParams.privateKey, transactionParams))
            } else {
                return await this.web3Contract.methods.createDemand(_regionId,_dateTimeFrom,_dateTimeTo,_power,_matchedPower)
                    .send({from: transactionParams.from, gas: transactionParams.gas}) 
            }
	}
	async setSupplyMatchedPower(_supplyId:number,_matchedPower:number, txParams?:SpecialTx){

            let transactionParams

            const txData = await this.web3Contract.methods.setSupplyMatchedPower(_supplyId,_matchedPower)
            .encodeABI()

            let gas

        

            if(txParams){

                if(txParams.privateKey){
                    const privateKey = txParams.privateKey.startsWith("0x") ? txParams.privateKey : "0x" + txParams.privateKey;
                    txParams.from = this.web3.eth.accounts.privateKeyToAccount(privateKey).address
                    txParams.nonce = txParams.nonce ? txParams.nonce : (await this.web3.eth.getTransactionCount(txParams.from))
                }

                if(!txParams.gas){

                    try{
                    gas = await this.web3Contract.methods.setSupplyMatchedPower(_supplyId,_matchedPower)
                        .estimateGas({ from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0]} )
                    } catch(ex){

                        if (!(await getClientVersion(this.web3)).includes('Parity')) throw new Error(ex) ;

                        const errorResult = await this.getErrorMessage(this.web3, 
                            {
                            from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0] ,
                            to: this.web3Contract._address,
                            data: txData,
                            gas: this.web3.utils.toHex(7000000)
                            }
                         )
                         throw new Error(errorResult);

                    }
                    gas = Math.round(gas*2)
                    
                    txParams.gas = gas 
                }

                transactionParams = {
                    from: txParams.from ? txParams.from : (await this.web3.eth.getAccounts())[0],
                    gas: txParams.gas ? txParams.gas : Math.round(gas * 1.1 + 21000),
                    gasPrice: 0,
                    nonce: txParams.nonce ? txParams.nonce : (await this.web3.eth.getTransactionCount(txParams.from)),
                    data: txParams.data ? txParams.data : '',
                    to: this.web3Contract._address,
                    privateKey: txParams.privateKey? txParams.privateKey: ""
                }
            }else {
                transactionParams = {from:(await this.web3.eth.getAccounts())[0],
                    gas:  Math.round(gas * 1.1 +21000),
                    gasPrice: 0,
                    nonce:  (await this.web3.eth.getTransactionCount((await this.web3.eth.getAccounts())[0])),
                    data: '',
                    to: this.web3Contract._address,
                    privateKey: ""
                }
            }
            
         
            if (transactionParams.privateKey !== '') {
            
                transactionParams.data = txData
                return (await this.sendRaw(this.web3, transactionParams.privateKey, transactionParams))
            } else {
                return await this.web3Contract.methods.setSupplyMatchedPower(_supplyId,_matchedPower)
                    .send({from: transactionParams.from, gas: transactionParams.gas}) 
            }
	}
	async getSupply(_supplyId:number, txParams?:SpecialTx){
		return (await this.web3Contract.methods.getSupply(_supplyId).call(txParams)) 
	}
	async getAllDemandListLength(txParams ?: SpecialTx){
		return (await this.web3Contract.methods.getAllDemandListLength().call(txParams)) 
	}

}
    