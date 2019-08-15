Meveo framework (mv)
====================

Purpose
-------
This framework is an extension of litElement library that allow to easily create html custom element that can comminucate with a backend meveo server.
Applications developped by the meveo are to be served by a meveo server, this server is called the backing meveo server of the application.

Model elements are elements that are backed by a Meveo Custom Entity (or list of), those element are stateful and their state can be persisted in memory, localstorage or server.

Form elements are element that are used to call a meveo Rest endpoint.

Sateful Elements
----------------
If an element need to be stateful then it should extend the MvElement class.
We have 2 kinds of stateful elements :
- Model elements that are displaying the information of an object (for instance the profile of the user) or a list of objects (for instance the todoItems of a todoList)
- Stateful Container elements that do not use state information themself but contain  model elements that exchange information

It will automatically inheritates the properties name and storageMode.
- name : Every stateful element need to have a name that must be unique amoung all the model elements of its parent element.
    If the element is to be stored on localstorage, the name should also be unique among all elements using localstorage in the domain.
- storageMode : Every Model element is associated to a store that is persited in memory and optionnally in localstorage and backing meveo server.
    the possible values are "local" and "server", you can also combine them "local,server" to both persist data in localstorage and backing server.


Store
-----
Each Model element is associated to a store. An fundamental characteristic of meveo framework is that the store is not necessarily responsible of handling the state of the element.
Indeed, if the model element is a child of another element, then the management of the state is delegated to the parent store.
In a web page there are special model elements that are not child of other model element; they are called root model elements.
There is hence one state handler per root model element.
An element is automatically registered as a listener on all the properties of it state that are defined in its model mapping.