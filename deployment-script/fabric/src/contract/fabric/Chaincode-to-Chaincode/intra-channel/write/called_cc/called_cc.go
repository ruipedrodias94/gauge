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
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)


var logger = shim.NewLogger("called_cc")
const INVALID_FUNCTION_NAME = "{\"reason\": \"invalid chaincode function name\"}"

type SimpleChaincode struct {

}

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	// nothing to do
	logger.Info("########### called_cc chaincode###########")
	return shim.Success(nil)
}

func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	logger.Info("INVOKE ", args)
	logger.Info("function ", function)
	if function == "open" {
		return t.Open(stub, args)
	}
	
	return shim.Error(INVALID_FUNCTION_NAME)
}


// open an account, should be [open account money]
func (t *SimpleChaincode) Open(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	logger.Info("called_cc4 args", args)
	//random key passed from client via chaincodes
	acccountId := args[0];	
	amount := args[1];
	logger.Info("the passed account id is ", acccountId)
	logger.Info("the amount is ",amount);

	// store passed accountId to ledger
	stub.PutState(acccountId,[]byte(amount));	
	
	//return accountId to calling chaincodes
	return shim.Success([]byte(acccountId));	
}

func  main()  {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting chaincode: %v \n", err)
	}

}
