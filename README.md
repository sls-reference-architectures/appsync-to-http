# appsync-to-http

Reference architecture to demonstrate AppSync to HTTP via VTL and IAM (acronym alert!)

The app uses basic CRUD operations on the `Product` resource. AppSync will handle AuthN/AuthZ, and everything GraphQL while ApiGateway will serve up the `Product` content.

All calls to the HTTP service will require IAM permissions and will expect appropriate v4sig-signed headers.
