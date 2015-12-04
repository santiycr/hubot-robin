# hubot-robin

A hubot robinpowered integration for getting room occupancy and other data about your office

See [`src/robin.coffee`](src/robin.coffee) for full documentation.

## Installation

In hubot project repo, run:

`npm install hubot-robin --save`

Then add **hubot-robin** to your `external-scripts.json`:

```json
[
  "hubot-robin"
]
```

## Sample Interaction

```
user1>> hubot rooms
hubot>> Hermione is free
hubot>> Garfunkel is free for 58 minutes
hubot>> Chewbacca is free
hubot>> Luigi is free for 12 minutes
```
