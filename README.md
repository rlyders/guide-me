# Guide-Me web app
I created this [Svelte](https://svelte.dev/) `Guide-Me` web app of just an initial 111 lines of code across two Svelte files ([App.svelte](src\App.svelte) and [HowTo.svelte](src\HowTo.svelte)) for fun as a prototype just to see how such a `Guide-Me` web app might be implemented. I went through various revisions until I finally landed upon this latest version. At first, I worked towards a live and dynamic UI of a flow-chart and decision tree with live connecting lines between draggable UI elements that the user would follow as they clicked on various choices. That flow-chart UI was visually interesting, but somewhat distracting and clunky. The current UI I designed in this web app is more user-friendly and easy to naturally traverse both forwards and in reverse. This current UI allows the user to easily go back to previous questions to change a prior choice.

* [Live demo app hosted via GitHub](https://rlyders.github.io/guide-me)
* [Live demo app hosted via Vercel](https://guide-me-mu.vercel.app)

One of my key design goals of this app was to allow this app to handle a wide variety of Guides without having to embed any business rules in the app code itself. I came up with a simple YAML file format that acts as the definition of each guide. Currently, the guide YAML definition files are a static collection of files manually created and stored in the `src/data/guides` folder of this project.

TODO: use a database as the backend to store and retrieve the Guide-Me definitions.

TODO: record the user activity and responses for each user session in this Guide-Me web app for later use for audits and general historical purposes.

TODO: allow users with proper access permissions to edit Guide-Me definitions directly in the UI by clicking an "Edit" button or something similar.

TODO: allow users with proper access permissions to create new Guide-Me definitions directly in the UI.

## Get started

Install the dependencies...

```bash
cd guide-me
npm install
```

...then prepare styles, build, and start:

```bash
npm run prepare
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see the Guide-Me app running.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.

If you're using [Visual Studio Code](https://code.visualstudio.com/) we recommend installing the official extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode). If you are using other editors you may need to install a plugin in order to get syntax highlighting and intellisense.

## YAML Guide-Me format
Be sure to check out the samples in `public/guides` to get familiar with the YAML format.
 * The `title` is the title/name of your Guide-Me that is displayed to the user:
    `title: Turn on lights`
 * Each step in the Guide-Me is simply defined as a YAML block such as:
    ```yml
    q1:
        question: Which lights do you want to turn on?
        choices:
            - kitchen: q2
            - pantry: pantryLights
            - bathroom: q2
            - backyard: backyardLights
    ```
    * `q1` can be any text phrase you find meaningful to describe the Guide-Me step. This is the key which acts as an identifier/alias for the guide step. This is referenced in other Guide-Me steps to define the next step for a given choice.
    * `question` is what is displayed to the user as a question that needs to be answered.
    * `choices` is a list of choices that the user will be able to select as the answer to the `question`.
    * Each choice has a name along with a value such as shown for the following 3 choices:
        ```yaml
            - inside: mobileAppHowTo
            - outside: webBrowserHowTo
            - too dark to be sure: http://wiki.abco.com/too-dark-guide
        ```
        * The choice's name (e.g. `inside`) is what is displayed to the user as an option that the user could be select as the answer to the question.
        * The choice's value (e.g. `mobileAppHowTo`) can be any of the following:
            * a URI to some web page or other data source. If the choice value is a URI then the URI is simply displayed to the user and the guide ends. 
                * TODO: this could be enhanced in the future to display the live contents of the web page as opposed to just showing the URI. 
            * a key to another guide step. If the choice value is a key to another guide step then the guide continues with that step when the user selects the choice.

## Add your own Guide-Me 
 * Create new `yaml` file in `./public/guides`
 * Import new `yaml` file into `main.ts` such as:
    `import myHowTo from '../public/guides/my-guide.yaml';`
 * Add your new imported object as the first item in the array of Guides:
    `let howTos = [myHowTo, customerFeedbackHowToData, turnOnLightsHowToData];`
 * Run the app to see your new guide
 * TODO: update the AppBar to allow the user to select the current Guide-Me from the list of available Guides

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).

## Deploying to the web

### With [Vercel](https://vercel.com)

Install `vercel` if you haven't already:

```bash
npm install -g vercel
```

Then, from within your project folder:

```bash
cd public
vercel deploy --name guide-me
```

### With [surge](https://surge.sh/)

Install `surge` if you haven't already:

```bash
npm install -g surge
```

Then, from within your project folder:

```bash
npm run build
surge public guide-me.surge.sh
```