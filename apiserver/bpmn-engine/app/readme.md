> The source code is organized in a clean architecture pattern. The main idea is to separate the business logic from the infrastructure and the framework. This way, the business logic is not tied to a specific framework or library, making it easier to change the framework or library in the future.

The project main layers includes:

- **Router**: This layer is responsible for receiving the HTTP requests and sending them to the controller. It is also responsible for sending the response back to the client.

- **Controller**: This layer is responsible for receiving the HTTP requests from the router and orchestrating the calling of use-case functions. It is also responsible for sending the response back to the router.

- **Use-case**: This layer is responsible for receiving the requests from the controller, executing the business logic and sending the response back to the controller.

- **Domain**: This layer is responsible for the business logic. It contains the entities, the value objects.

- Other external layers: These layers are responsible for the infrastructure and the framework. They contains the database, the HTTP server, the email server, etc.

```                                                                 
 +-----------------+      +-------------------+      +-------------------+
 |                 |      |                   |      |                   |
 |      Router     |----->|    Controller     |----->|    Use-case       |
 |                 |      |                   |      |                   |
 +-----------------+      +-------------------+      +-------------------+
                                                               ^          
                                                               |          
                                                     +-------------------+
                                                     |                   |
                                                     |     Domain        |
                                                     |                   |
                                                     +-------------------+
```