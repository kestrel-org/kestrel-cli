# Command Reference for kc

## **kc new**

Create new project based on the angular/node template

**kc <span style="color:gray">new**</span> <span style="color: lightblue">\<project-name></span> [options]

#### **Arguments**


| Argument       	| Description                                                                      	| Type   	| Required 	|
|----------------	|----------------------------------------------------------------------------------	|--------	|----------	|
| `<project-name>` 	| Name of the new project (only lower case, dashes <br>and underscore are allowed) 	| `string` 	|   Yes     |

#### **Options**

| Option      	    | Description                    	| Type    	    | Required 	|
|-------------	    |--------------------------------	|---------	    |----------	|
| `--back`, `-b`  	| Generate only the node part    	| `boolean` 	| No       	|
| `--front`, `-f` 	| Generate only the angular part 	| `boolean` 	| No       	|

#### **Usage**

```
$ kc new my-project
```
    
