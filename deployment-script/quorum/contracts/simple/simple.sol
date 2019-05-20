/*
 * Created on Wed Mar 28 2018
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

// Versão de pragma Solidity desatualizada
pragma solidity ^0.4.18;
contract simple {
    /**
        Mappings is another way of declaring data
        We can think of an Mapping as a Key_Value store.
        So in this example:
            .key = string
            .value = bytes32
        So, we will store accounts in map. And we will lookup for accounts in map by the string.
     */
    mapping(string => bytes32) private map;

    // Update map key to account value
    function open(string _key, bytes32 _value) {
        map[_key] = _value;
    }

    // Return the values added previously 
    function query(string _key) constant returns(bytes32) {
        return map[_key];
    }
}
