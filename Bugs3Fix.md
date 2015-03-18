# Bugs
Some bugs I found that need 3 be fixed.

## Major
- **Scrolling**
- **URL regex detection**
  - Need to find a new way of allowing people to post links without using the old regex expression and the while loop. This caused the main page to freeze on load.

## Minor
- **Noticable lengthy loading times for smaller channels**
  - Will often get a white screen when a machine first visits a new channel, also sometimes followed by a warning saying the websocket has closed. This white screen stays on the screen too long a time.
- **Posts do not load on mobile browsers**
- **Hyperlinks**
  - Some strings that should be links are not noticed by the regex expression or are not automatically turning into hyperlinks when they should.