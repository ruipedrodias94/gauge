/*
 * Created on Thu Apr 19 2018
 *
 * Copyright 2018 Persistent systems limited.
 *
 *Licensed under the Apache License, Version 2.0 (the "License");
 *you may not use this file except in compliance with the License.
 *You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *Unless required by applicable law or agreed to in writing, software
 *distributed under the License is distributed on an "AS IS" BASIS,
 *WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *See the License for the specific language governing permissions and
 *limitations under the License.
 */

package main

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

const INVALID_ACCOUT_ID = "{\"reason\": \"invalid account ID\"}"
const INVALID_FUNCTION_NAME = "{\"reason\": \"invalid chaincode function name\"}"

var logger = shim.NewLogger("caller_cc")

type SimpleChaincode struct {
}

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	// nothing to do
	logger.Info("########### caller_cc chaincode###########")
	return shim.Success(nil)
}

func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()

	
	if function == "query" {
		return t.Query(stub, args)
	}
	
	if function == "addaccounts" {
		return t.addAccounts(stub, args)
	}
	
	if function == "checkprepopulatedata" {
		return t.CheckPrePopulate(stub, args)
	}
	return shim.Error(INVALID_FUNCTION_NAME)
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
		fmt.Println("the accound_id is ", accountid)
		fmt.Println("the value is ", strconv.Itoa(i))

		err = stub.PutState(accountid, []byte(strconv.Itoa(i)))
		if err != nil {
			return shim.Error(err.Error())
		}
	}

	logger.Info("########### created accounts successfully ###########")
	fmt.Println("startkey:  ", args[0])
	fmt.Println("endkey:  ", args[1])
	return shim.Success(nil)

}

// query current money of the account,should be [query account]
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	logger.Info("query chaincode2 args.", args)
	money, err := stub.GetState(args[0])

	if err != nil {
		logger.Info("key not present ")
		return shim.Error(err.Error())
	}

	if money == nil {
		logger.Info("money nil ")
		return shim.Error(INVALID_ACCOUT_ID)
	}

	return shim.Success([]byte(args[0]))
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
	fmt.Println("########### searched all accounts successfully > ###########: ", i)

	return shim.Success([]byte(strconv.Itoa(i)))

}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting chaincode: %v \n", err)
	}

}
