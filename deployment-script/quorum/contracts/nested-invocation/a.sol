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

contract a {
    b B;
    function a() public {
        B =  new b();
    }
    
    function  query(string _key) public constant returns(bytes32) {
      return  B.query(_key);
    }
    
    function open(string _key, bytes32 _value) public {
        B.open(_key, _value);
    }
   
}

contract b {
    c C;
    function b() public {
        C = new c();
    }
    
    function query(string _key) public constant returns(bytes32) {
       return C.query(_key);
    }
    
    function open(string _key, bytes32 _value) public {
         C.open(_key, _value);
    }
   
}

contract c {
    d D;
    
    function c( ) public {
         D = new d();
    }
    
    function query(string _key) public constant returns(bytes32) {
       return D.query(_key);
    }
    
    function open(string _key, bytes32 _value) public {
         D.open(_key, _value);
    }
   
}

contract d {
    mapping(string=>bytes32) map;
    function query(string _key) public constant returns(bytes32) {
        return map[_key];
    }
    
    function open(string _key, bytes32 _value) public {
        map[_key]=_value;
    }
   
}
