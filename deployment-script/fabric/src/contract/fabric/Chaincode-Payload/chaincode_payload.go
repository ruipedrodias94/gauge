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
 var logger = shim.NewLogger("simpletest")
 
 type SimpleChaincode struct {
 }
 
 func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	 // nothing to do
	 logger.Info("Chaincode Paylaod size Microbenchmark test")
	 return shim.Success(nil)
 }
 
 func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	 function, args := stub.GetFunctionAndParameters()
 
	 if function == "invokewithoutevents" {
		 return t.invokewithoutevents(stub, args)
	 }
	 if function == "invokewithevents" {
		return t.invokewithevents(stub, args)
	}
	 return shim.Error(INVALID_FUNCTION_NAME)
 }
 
 func (t *SimpleChaincode) invokewithoutevents(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	
	acccountId := args[0]
	 amount := args[1]
	 stub.PutState(acccountId, []byte(amount))
	 return shim.Success(nil)
 
 }

 func (t *SimpleChaincode) invokewithevents(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	
	acccountId := args[0]
	amount := args[1]
	stub.PutState(acccountId, []byte(amount))
	stub.SetEvent("eventid", []byte(amount))
	return shim.Success(nil)

}
 
 func main() {
	 err := shim.Start(new(SimpleChaincode))
	 if err != nil {
		 fmt.Printf("Error starting chaincode: %v \n", err)
	 }
 
 }
 