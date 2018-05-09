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

pragma solidity ^0.4.15;
contract ioheavy {

    mapping(uint => uint) public map;

    function seedMap(uint _start, uint _end) public {
        for(uint i=_start;i<_end;i++) {
            map[i] = i;
        }
    }

    function open(uint  _key, uint _value) public {
        map[_key] = _value;
    }

    function query(uint _key) constant returns(uint) {
        return map[_key];
    }
}
