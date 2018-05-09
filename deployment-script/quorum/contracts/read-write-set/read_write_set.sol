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

pragma solidity ^0.4.18;
contract read_write_set {
    
    mapping(uint => uint) public map;
    
    event Finished();

    function open(uint _len) public {
        uint i=0;
        for(i=0;i<_len;i++) {
            map[i]=i;
        }
        Finished();
    }

    function query(uint _len) public constant returns(uint[]) {
        uint[] memory temp = new uint[](_len);
        uint i=0;
        for(i=0;i<_len;i++) {
            temp[i]=map[i];
        }
        return temp;
    }
}
