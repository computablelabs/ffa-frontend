## HOW TO USE

Unfortunately we are unable to drop a `.sass` directly into an html file. We need to compile the `.sass` to `.css` instead. There are a few programs to do this, check out a list in the sass docs [here](https://sass-lang.com/install). I personally chose to use [Scout-App](https://scout-app.io/). Once you've downloaded your program of choice, follow the following steps.
1. Choose your local copy of `ffa-frontend` as your project of choice.
2. Compile _from_ folder `/ffa-frontend/src/assets/style/components` _to_ `/ffa-frontend/html/style/`
  * The program should compile to css on change + save of the `voting-detail.sass` file.  
3. Open the `index.html` file within `/html` by `right clicking + open with` or drag the file to an open browser.
4. You will need to refresh the open `index.html` page in your browser every time you make a change to the `.sass` or `html`
5. Change `index.html` + `voting-detail.sass` as needed to demo changes.
  * class `.pass-marker`'s `width` property corresponds to dashed line indicating passing voting threshold. 
  * class `.progress-bar`'s `width` property corresponds to the accepted votes bar fill.
