# Random Bits

What you see here is sample code snippets from my work. I cannot disclose the entire code bases due to obvious reasons

## DistributedCubeProcessor

This is a project done for a job interview. 
The intent is that a data cube is handed to multiple process nodes. Each process node has a part of the data cube due to hardware limitations. 
Nodes should talk to eachother and determine the median of the data cube

This was done using muti-threaded approach 

## angular components ##

* address-search - A basic address search that interfaces with a 'sensis totalcheck api' wrapped in a .net Core back end
* component-modal - an angular modal in which you can render any angular component you desire
* notifications - A table of user notifications, when you click one it expands to the details in place where a component of base type NotificationBase is injected. 
                    If defined it will retrieve the content/latest snapshot of that notification from the server. (I removed the most of the concrete implementations)
* two-factor-auth - a session state based 2 factor authentication system
* google-map - component that intearcts with google geocoder api to get pin locations using an address we retrieved via address-search's api and render the map on screen (not impressive at all but was a cool learning experince)

## dot_net_core_test - FileAnalyzer

This is a fun little project/test that I did during an interview cycle for a job. (all the stuff you see hear is learnt with in a 1 - 1.5 day period) 

https://github.com/supunt/CSVProcessor - has a better readme

## QTFtpClient
This is an old project of mine that I did for an employer during my C++ days that never saw production or UAT

## random_js_bits_from_a_sandbox

this contains some simple code bits that I wrote while I was LEARNING javascript. 
This is a part of a sandbox for a SignalR client used by an MVC app that did something awesome
https://github.com/supunt/randomJsBits


## dot_net_fw 
* state-machine - A base class types of a state machine that was used to interact with data from TCP clients (i.e. Cameras, PLCs)
* PLC - A plc client that was derived from the state machine
* database - A DB connection manager ish, derived from the state machine running on it's own thread
* HttpJsonUtilsEx - A Template helper that wraps HttpClient calls and send/receive result back and forth in template type

## An Angular project with Server Side Rendering and a express server
* refer to https://github.com/supunt/angular-universal

## Digital Clock
* A question by a fellow stackoverflow'er that I fixed (https://stackoverflow.com/questions/61979779/how-to-let-my-code-works-for-7-segment-digital-clock-in-javascript/61980381#61980381)
