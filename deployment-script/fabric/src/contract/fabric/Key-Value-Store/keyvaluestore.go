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
	"fmt"
	"strconv"
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
	if function == "query" {
		return t.Query(stub, args)
	}
	if function == "addaccounts" {
		return t.addAccounts(stub, args)
	}
	if function == "checkprepopulatedata" {
		return t.CheckPrePopulate(stub, args)
	}
	return shim.Error(ERROR_WRONG_FORMAT)
}

//add accounts from range
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

		err = stub.PutState(accountid, []byte(strconv.Itoa(i)))
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	logger.Info("########### created accounts successfully ###########")
	return shim.Success(nil)

}

// open an account, should be [open account money]
func (t *SimpleChaincode) Open(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	acccountId := args[0]
	amount := args[1]
	stub.PutState(acccountId, []byte(amount))
	return shim.Success(nil)

}


// query current money of the account,should be [query accout]
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error(ERROR_WRONG_FORMAT)
	}

	money, err := stub.GetState(args[0])
	if err != nil {
		s := fmt.Sprintf(ERROR_SYSTEM, err.Error())
		return shim.Error(s)
	}

	if money == nil {
		return shim.Error(ERROR_ACCOUT_ABNORMAL)
	}

	return shim.Success(money)
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

	return shim.Success([]byte(strconv.Itoa(i)))

}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting chaincode: %v \n", err)
	}

}
