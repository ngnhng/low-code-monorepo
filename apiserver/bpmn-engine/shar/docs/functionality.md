## Functionality

Here is a list of functionality supported by the parser and engine.  Over time, these will be revisited and any missing items will hopefully be implemented. 

| Camunda Functionality            | supported? | Expressions? |
|----------------------------------|------------|--------------|
| Start Event                      | Yes        | N/A          |
| End Event                        | Yes        | N/A          |
| Service Task                     | Yes        | No           |
| User Task                        | Yes        | No           |
| Manual Task                      | No         | N/A          |
| Script Task                      | No         | N/A          |
| Business Rule Task               | No         | N/A          |
| Exclusive Gateway                | Yes        | No           |
| Sequence Flow                    | Yes        | Yes          |
| Call Activity                    | Yes        | No           |
| Send Task                        | No         | N/A          |
| Message Intermediate Throw Event | Yes        | No           |
| Message Intermediate Catch Event | Yes        | No           |
| Timer Intermediate Catch Event   | Yes        | No           |
| Error Boundary Event             | Yes        | No           |
| Timer Boundary Event             | No         | No           |