/**
* Original work Copyright 2017 HUAWEI. All Rights Reserved.
*
* Modified work Copyright Persistent Systems 2018. All Rights Reserved.
* 
* SPDX-License-Identifier: Apache-2.0
*
*/

package main

import (
	
	"strconv"
	"fmt"
	"strings"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)


const ERROR_SYSTEM = "{\"code\":300, \"reason\": \"system error: %s\"}"
const ERROR_WRONG_FORMAT = "{\"code\":301, \"reason\": \"command format is wrong\"}"
const ERROR_ACCOUNT_EXISTING = "{\"code\":302, \"reason\": \"account already exists\"}"
const ERROR_ACCOUT_ABNORMAL = "{\"code\":303, \"reason\": \"abnormal account\"}"
const ERROR_MONEY_NOT_ENOUGH = "{\"code\":304, \"reason\": \"account's money is not enough\"}"

var logger = shim.NewLogger("simpletest")

type SimpleChaincode struct {
}

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	// nothing to do
	logger.Info("########### simpletest Init KVS only chaincode###########")
	return shim.Success(nil)
}

func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()

	if function == "open" {
		return t.Open(stub, args)
	}
	if function == "checkprepopulatedata" {
		return t.CheckPrePopulate(stub, args)
	}
	if function == "addaccounts" {
		return t.addAccounts(stub, args)
	}
	return shim.Error(ERROR_WRONG_FORMAT)
}
func (t *SimpleChaincode) addAccounts(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	args[0] = strings.TrimSpace(args[0])
	args[1] = strings.TrimSpace(args[1])

	firstargs, err := strconv.Atoi(args[0])
	secondargs, err := strconv.Atoi(args[1])
	if err != nil {
		return shim.Error(err.Error())
	}
	for i := firstargs; i < secondargs; i++ {

		accountid := "accountno_" + strconv.Itoa(i)

		logger.Info("the accound_id is ", accountid)
		logger.Info("the value is ", strconv.Itoa(i))

		err = stub.PutState(accountid, []byte(strconv.Itoa(i)))
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	logger.Info("########### created accounts successfully ###########")
	logger.Info("startkey:  ", args[0])
	logger.Info("endkey:  ", args[1])
	return shim.Success(nil)

}
// open an account, should be [open account money]
func (t *SimpleChaincode) Open(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	limit, _ := strconv.Atoi(args[0])
	logger.Info("limit is ", limit)

	for i := 0; i < limit; i++ {

		accountid := "accountno_" + strconv.Itoa(i)

		logger.Info("the accound_id is ", accountid)

		money, err := stub.GetState(accountid)

		if err != nil {
			return shim.Error(err.Error())
		}

		stub.PutState(accountid, money)
	}
	logger.Info("########### updated all accounts successfully > ###########")

	return shim.Success(nil)
}

func (t *SimpleChaincode) CheckPrePopulate(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	i := 0
	iterator, err := stub.GetStateByRange("", "")
	if err != nil {
		return shim.Error(fmt.Sprintf("stub.GetStateByRange failed, err %s", err))
	}
	defer iterator.Close()
	for iterator.HasNext() {

		_, _ = iterator.Next()
		i++
	}
	logger.Info("########### searched all accounts successfully > ###########: ", i)

	return shim.Success([]byte(strconv.Itoa(i)))

}
func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		logger.Info("Error starting chaincode: %v \n", err)
	}

}
