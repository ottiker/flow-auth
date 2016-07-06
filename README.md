# Flow Authentication
Authentication module for flow.
### Global config
```json
{
    "token": {
        "duration": 600000,
        "secret": "longRandomString"
    },
    "session": {
        "cookieName": "SES", 
        "requestKey": "session",
        "secret": "longRandomString", 
        "duration": 86400000,
        "activeDuration": 1800000,
        "cookie": {
            "ephemeral": true, 
            "httpOnly": true,
            "secure": true
        }
    }
}
```
### Flow composition
```json
{
    "flow": {
        "token.create": {
            "d": [
                [":flow_tools/transform", {
                    "content": "{user_email}"
                }],
                ":token.create"
            ]
        },
        "token.validate": {
            "d": [
                [":flow_tools/transform", {
                    "token": "{token}"
                }], 
                ":token.validate"
            ]
        },
        "session.get": {
            "d": [
                ":session.get"
            ]
        },
        "session.set": {
            "d": [
                [":flow_tools/transform", {
                    "user": "{user_id}",
                    "role": "{user_role}",
                    "lang": "{user_lang}"
                }]
                ":session.set"
            ]
        },
        "session.destroy": {
            "d": [
                ":session.destroy"
            ]
        }
    }
}
```
