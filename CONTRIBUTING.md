If you are not a developer
--------------------------

- My english is a pity. You may help me to correct it.
- You may test on some platforms. Mainly MacOS, iOS and Edge; and see some problems when comparing to Firefox or Chrome.
- You can re-read my doc, and ask me some precisions.
- You may be have a disability and you're using some accessibility tools… You're super useful ! For sure, I missed something important for you.
- Perhaps you can help me on translations, the design or the logos.
- Install in your own website, test, note the bugs, [report them in the issues section of the repo](https://github.com/dascritch/cpu-audio/issues). If you're not enough GitHub savvy, you can [write me via this page](https://cpu.dascritch.net/pages/CPU-Audio-Player)


If you are a developer
----------------------

- Clone the project, use the `preprod` branch and merge into it
- Always prefer any W3C standards instead of create something.
- Think about clean code, minimalism, small parts, expressive variables and functions.
- Try to write a test, even for the UI. I know, the last part is hard, but it helps so much.
- Categorize the tests.
- If you add parameters, attributes, CSS variables,… keep the web component able to run without.
- Document everything, even dead-ends. Someone can find interesting your regrets.
- Work by cloning the `preprod` branch. We merge in `master` when everything is alright.
- Check first in [TODO.md](TODO.md) which lists some priorities and objectives. I usually [create bugs](https://github.com/dascritch/cpu-audio/issues) and refers to them in my commits. Most of the time.
- Node.js 14 is mandatory to run CLI tests with modules.
- Most of functions and methods are now javadoc-style commented, be kind about it.


If you are integrating HTML
---------------------------

 - The WebComponent **should always be** autonomous, never use a external reference (font, image, etc).
 - Avoid to create HTML tags unwisely : try to have a minimum footprint, use specific tag names for what they mean.
 - Any image should be in SVG format included in the HTML source, we won't accept bitmap formats.
 - Due to CSP restrictions we cannot control, avoid fonts, images inlined into css, etc… 
 - Do **not** inline styles, never `style=""`, `background=""` in HTML or `fill=""` in SVG.
 - Do **not** inline javascript, any event should be in a named function, and bound it via a DOMelement`.addEventListener()`, and nothing else.
 - Try to group CSS properties into CSS varables, and document them : it helps to not repeat yourself, and someone may need to change them.
 - Be wise : SVG path can be declared as symbols to reuse them.
 - Simplify your path in SVG:`<path d="">` : we don't have 10000 dpi screens yet. Use preferably `viewport="0 0 32 32"`, have only one digit precision after decimal point and reduce number of points if your path.
 - You can create you own themes, with specific HTML and/or CSS files stored in `src/themes/your-theme`, see ([#56](#56)). It will help to resolve issues ([#26](#26)) and ([#51](#51)). You may probably create more fancy versions of my player by this way, but you will have to use the `./make.sh --theme your-theme` command to build it. Note that themes can be private and not committed if their name start with a `_`.


Tests
-----

As I'm not perfect, some tests were written for non-regressions, conformity and check feature support by browsers. Please contribute also in tests, we really need a rock solid players with a few regressions as possible.

 - [Browser compliance, feature detections and implementation tests](./tests/tests-browser.html)
 - [Minimum services available even without webcomponent part, as hash links](./tests/tests-minimal.html)
 - [Graphic interface and webcomponents-dependant features](./tests/tests-interface.html)
 - [API method names](./tests/tests-api.html)

Please note that tests aren't done yet on non default themes.

Development
-----------

To make the `build/` files, run `./make.sh`

You will need to add packages via `npm install` to finalize `build/*` files.

If you're not working on `master` or `preprod` original branches, try to avoid to commit `build/*` files, to avoid conflicts during merge.


<!-- {% include footer.html %} -->
