# Engine Login
A login module for Engine

## Configuration
```js
{
    "roles": {
        "*": true
    },
    "name": "my_login", // module instance name
    "module": "login", // npm node module name
    "client": {
        "config": {                     // the values below are the defaults
            // the URL to navigate after logout
            "homeUrl": "/",
            // the URL to navigate after successful login or signup
            "successUrl": "/",
            // the name of the cookie that stores the session
            "sessionCookie": "sid",
            // the name of the query string parameter that stores return URLs
            "returnParam": "return",
            // set to true if this module should reload the page instead of soft navigation
            "redirect": true,
            // set to true if you want this module to emit events on the way
            "emitEvents": true
        }
    }
}
```

## Emitted events

If the `emitEvents` options is set to true, the following events will be emitted:

| Event                | Description   |
| -------------------- | ------------- |
| `login_signup`       | Emitted before the signup request is sent. |
| `login_signup_ok`    | Emitted on a successful signup request.    |
| `login_signup_error` | Emitted when an error occurs upon signup.  |
| `login_login`        | Emitted before the login request is sent.  |
| `login_login_ok`     | Emitted on a successful login request.     |
| `login_login_error`  | Emitted when an error occurs upon login.   |
| `login_logout`       | Emitted before the logout request is sent. |
| `login_logout_ok`    | Emitted on a successful logout request.    |
| `login_logout_error` | Emitted when an error occurs upon logout.  |

## How to contribute

1. File an issue in the repository, using the bug tracker, describing the
   contribution you'd like to make. This will help us to get you started on the
   right foot.
2. Fork the project in your account and create a new branch:
   `your-great-feature`.
3. Commit your changes in that branch.
4. Open a pull request, and reference the initial issue in the pull request
   message.

