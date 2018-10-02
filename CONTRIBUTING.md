Check first in [TODO.md](TODO.md) which lists some priorities and objectives.

I usually [create bugs](https://github.com/dascritch/cpu-audio/issues) and refers to them in my commits. Most of the time.

I'm sorry but due to draft rewrites and refactoring, I've lost most of the git history. Git blaming won't help for the code before September 2018.


Hygiene
-------

- Always prefer any W3C standards instead of create something.
- Think about clean code, small parts, expressive variables and functions
- Try to write a test, even for the UI. I know, the last part is hard, but it helps so much
- Categorize the tests :
  - [Browser implementations and feature detections](./test-browser.html)
  - [minimal functions, available even without webcomponent part](./test-minimal.html)
  - [UI interfaces and webcomponents-dependant features](./test-interface.html)
- Document everything, even dead-ends. Someone can find interestings your regrets.

Development
-----------

You will need :
- sed
- tr
- [Google closure compiler](https://developers.google.com/closure/compiler/) (an so, Java, sigh). Don't forget to keep it up to date.


How to
------

To make the `dist/` files, use `./make.sh`

Please, contribute also in tests, we really need a rock solid players with a few regressions as possible
