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
var logger = shim.NewLogger("called_cc")

type SimpleChaincode struct {
}

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	// nothing to do
	logger.Info("########### called_cc chaincode###########")
	return shim.Success(nil)
}

func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()

	if function == "open" {
		return t.Open(stub, args)
	}

	return shim.Error(INVALID_FUNCTION_NAME)
}

// open an account, should be [open account money]
func (t *SimpleChaincode) Open(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	logger.Info("Called function 1")
	response := function2(stub, args[0])
	stub.PutState(string(response.Payload), []byte("100"))
	return shim.Success(nil)
}

func function2(stub shim.ChaincodeStubInterface, arg1 string) pb.Response {
	logger.Info("Called function 2")

	response := function3(stub, arg1)
	stub.PutState(string(response.Payload), []byte("100"))
	return shim.Success(response.Payload)
}

func function3(stub shim.ChaincodeStubInterface, arg1 string) pb.Response {
	logger.Info("Called function 3")

	response := function4(stub, arg1)
	stub.PutState(string(response.Payload), []byte("100"))
	return shim.Success(response.Payload)
}

func function4(stub shim.ChaincodeStubInterface, arg1 string) pb.Response {
	logger.Info("Called function 4")

	amount := "100"
	stub.PutState(arg1, []byte(amount))
	return shim.Success([]byte(arg1))
}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting chaincode: %v \n", err)
	}

}
