## HOW TO USE
  In order to use `.sass` with raw html files we must compile them into `.css` files. This can be done using the `node-sass` package.
1. Run `yarn install` when cloning the `ffa-frontend` project locally.
2. Ensure you are in the `ffa-frontend` directory in your terminal.
3. Run the following command `node-sass -w src/assets/style/components/voting-details.sass html/style/voting-details.css`. This compiles the sass to css in a watched state, meaning saving auto-compiles.
 * If that doesn't work, install `node-sass` globally via the following command: `yarn global add node-sass`
4. Open the `index.html` file within `/html` by `right clicking + open with [browser of choice]` within finder or drag the file to an open browser's header.
5. You will need to refresh the open `index.html` page in your browser every time you make a change to the `.sass` or `html` files.
6. Change `index.html` + `voting-details.sass` as needed to demo changes.
  * class `.pass-marker`'s `width` property corresponds to dashed line indicating passing voting threshold. 
  * class `.progress-bar`'s `width` property corresponds to the accepted votes bar fill.

Feel free to ask Melvin for any additional questions.
