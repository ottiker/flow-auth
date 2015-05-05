# Engine Trminal
The web term version for Engine

## Configuration
```js
{
    "roles": {
        "*": true
    },
    "name": "my_login", // module instance name
    "module": "login", // npm node module name
    "client": {
        "config": {                 // the values below are the defaults
            "homeUrl": "/",         // the URL to navigate after logout
            "loginUrl": "/login",   // the URL to navigate when not logged in and accessing private pages
            "successUrl": "/",      // the URL to navigate after successful login or signup
            "sessionCookie": "sid", // the name of the cookie that stores the session
            "returnParam": "return"  // the name of the query string parameter that stores return URLs
        }
    }
}
```

## How to contribute

1. File an issue in the repository, using the bug tracker, describing the
   contribution you'd like to make. This will help us to get you started on the
   right foot.
2. Fork the project in your account and create a new branch:
   `your-great-feature`.
3. Commit your changes in that branch.
4. Open a pull request, and reference the initial issue in the pull request
   message.

