## Becoming a Maintainer

The documentation for becoming a maintainer has been taken from [Foreman](https://theforeman.org/handbook.html#Becomingamaintainer) and adapted for the OpenShift Application Migration UI project.

As a maintainer, it is your responsibility to help manage and maintain the health of the Konveyor project. A Konveyor maintainer has commit permissions to one or more of the repositories under the [Konveyor organization](https://github.com/konveyor). To see a list of maintainers to the Konveyor project, view the [Konveyor GitHub Teams](https://github.com/orgs/konveyor/teams) page.

Maintainers are members of the Konveyor community who exhibit most of the following behaviors:

- Review and merge code and documentation.
- Help triaging bugs and testing pull requests.
- Make well formed pull requests.
- Have a sense of duty about the project.
- Play well with others, are respectful, show gratitude.

If you want to become a maintainer, we expect you to:

- Add screenshots of any UI changes in your PR.
- Within the PR description, tag any issues your PR closes with `Closes #insertIssueNumberHere`.
- Review and test pull requests submitted by others.
- Encourage and ensure design remains an integral part of the review process and pull in [Vince Conzola](https//github.com/vconzola) for UX review as needed.
- Support users and other developers on [CoreOS Slack](https://coreos.slack.com/) (there is a channel dedicated to mig-ui).

### Tech Stack

### K8s Client

[Erik](https://github.com/eriknelson) developed an integration layer for interfacing with the k8s apis. Code for this & the underlying technologies involved can be found in the shared lib-ui repository [@lib-ui](https://github.com/konveyor/lib-ui). An example of how to consume the client is found within `src/client/helpers.ts`.

A 3rd party promise library, [Q](https://github.com/kriskowal/q/wiki/API-Reference), is used to chain multiple results together & allows us to reliably manage results from api calls that have dependencies on eachother. Examples with helpful comments can be found within `sagas.ts` files.

#### React

We are using React 16.x. Our project uses [functional components](https://reactjs.org/docs/components-and-props.html), [hooks](https://reactjs.org/docs/hooks-reference.html), and [ context](https://reactjs.org/docs/context.html).

#### Redux

For state management within the app, we use [Redux](https://react-redux.js.org/)

To handle side-effects, we use [Redux Saga](https://redux-saga.js.org/). We leverage sagas to create a seperate thread in our app designed to handle data fetching, resource polling, and any other background tasks relevant to keeping the UI in sync with the underlying [controller API](https://docs.google.com/document/d/1BWlSlsrV_uzjLyFVkoYmjHaNHs-F__exMAh8yTVqAeg/edit?usp=sharing).

#### Patternfly & SASS Modules

To style the application, we are using [Patternfly](https://patternfly-react.surge.sh/) alongside [Sass modules](https://medium.com/clover-platform-blog/modular-scss-and-why-you-need-it-6bb2d8c40fd8).<br>
<br>
Instructions for adding style to a component:

1. Inside the .jsx component file:
   `const styles = require('./AddEditStorageForm.module').default;`

2. Create a new file in the component directory called:
   `AddEditStorageForm.module.scss`

3. Add style to .scss module file:
   `.testStyleForComponent{ color: red}`

4. In .jsx component file, you can style your JSX using the:
   `<GridItem className={styles.testStyleForComponent}>`

#### Directory Structure

We have adopted the [ducks pattern](https://www.freecodecamp.org/news/scaling-your-redux-app-with-ducks-6115955638be/) for structuring our application.

### Testing

We are using [Jest](https://jestjs.io/) as our testing framework foundation along with [Testing Library](https://testing-library.com/) for testing UI components.

#### Tests and UI Components

We adhere to the principles of the [Testing Library](https://testing-library.com/docs/guiding-principles) framework
because it gives us more confidence in validating the application as close as possible to the user.

Which also means we're more focusing in testing complex UI components instead of _leaf_ components.
The latter are more likely to change, making tests more brittle and creating unncessary overhead.

Therefore there is no need to test each _leaf_ component, unless it brings any specific value.

UI _Component Unit Tests_ cover _non connected_ components.
While _Integration Tests_ cover "connected" components.

_Note 1_: Testing UI components this way is not considered _pure unit testing_ and we're fine with that, again it's all about the confidence tests provide instead of a _false sense_ of code coverage.

_Note 2_: When implementing tests, it's common to get output from React Testing Library (when using `screen.debug()` or `screen.getByRole('')` instructions). Meanwhile to avoid the output to be truncated, use env `DEBUG_PRINT_LIMIT` variable, i.e. `export DEBUG_PRINT_LIMIT="100000"`.

To stay close to simulating end-user interaction with the application it's important to query DOM elements being visible on a page instead of pulling internal components or nodes. Please get familiar with the queries priority order from [Using queries](https://testing-library.com/docs/guide-which-query).

Besides Testing Library's documentation, here are few good sources to help acquire a practical knowledge:

- https://www.robinwieruch.de/react-testing-library
- https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- https://www.polvara.me/posts/five-things-you-didnt-know-about-testing-library/c

### Quick tips for new maintainers

- A good place to start contributing would be [here](https://github.com/konveyor/mig-ui/issues?q=is%3Aissue+is%3Aopen+label%3Alow-hanging-fruit). Low-hanging fruit tags indicate that these issues would be relatively straightforward to pick up.
- If something you merged broke something, it’s your responsibility to resolve or coordinate how to resolve the issue.
  [1]: http://contributor-covenant.org/version/1/4/code_of_conduct.md

### ESLint/Prettier

ESLint uses Prettier package to apply code formating rules.
So we don't have to worry about code style as ESLint `.eslintrc.js` and Prettier `.prettierrc.json` rules have the last word.

Running `yarn lint:fix` reformats all files according to the defined rules

#### On demand VSCode formating

Developers using Visual Studio Code can have code source reformated on demand from the editor, this is the equivalent of applying `yarn eslint <file> --fix`.

Make sure to first add [Prettier package](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) to VSCode.

Then once the following is added to VS Code configuration file `settings.json`, you can use `Ctrl + Shift + I` command to reformat current buffer (or alternatively use "Show All Command" with `Ctrl + Shift + P` then type `Format Document`):

```
{
  "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        { "language": "typescript", "autoFix": true },
        { "language": "typescriptreact", "autoFix": true }
    ],
}
```

#### VSCode formating on file saving

To have VSCode to automatically reformat the current edited file on saving just add following to VS Code `settings.json`:

```
{
  "editor.formatOnSave": false,
  "[javascript]": {
      "editor.formatOnSave": true
    },
    "[javascriptreact]": {
      "editor.formatOnSave": true
    },
    "[typescript]": {
      "editor.formatOnSave": true
    },
    "[typescriptreact]": {
      "editor.formatOnSave": true
    }
}
```
