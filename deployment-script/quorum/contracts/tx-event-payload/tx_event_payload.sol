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
contract tx_event_payload {

    string str;

    event Finished(string str);

    function open(string _str) {
        str=_str;
        Finished(str);
    }

    function query() constant returns(string) {
        return str;
    }
}
