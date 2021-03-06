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


const INVALID_FUNCTION_NAME = "{\"reason\": \"invalid chaincode function name\"}"
var logger = shim.NewLogger("caller_cc")

type SimpleChaincode struct {

}

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	// nothing to do
	logger.Info("########### caller_cc3 chaincode###########")
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

	// arg0 - fn name
	// arg1 - query key

	chainCodeToCall := args[3]
	newArgs := []string{"open"}
	for _, arg1 := range args {
		newArgs = append (newArgs,arg1) 
	 }

	 logger.Info("called_cc3 args", newArgs)

	bargs := make([][]byte, len(newArgs))
	for i, arg := range newArgs {
		bargs[i] = []byte(arg)
	}

	invokeArgs := bargs;
	// invoke other cc's
	response := stub.InvokeChaincode(chainCodeToCall, invokeArgs, "");
	
	if response.Status != shim.OK {
		errStr := fmt.Sprintf("Failed to invoke chaincode. Got error: %s", string(response.Payload))
		logger.Info(errStr)
		return shim.Error(errStr)
	}

	logger.Infof("Invoke chaincode successful. Got response %s", string(response.Payload))
	stub.PutState(string(response.Payload), []byte("100"))
	return shim.Success([]byte(string(response.Payload)))
}


func  main()  {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting chaincode: %v \n", err)
	}

}
