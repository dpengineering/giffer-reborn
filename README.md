# giffer-reborn

A completely rewritten version of the DPEA giffer tool by pcgrosen, original [here](https://github.com/ckaufer/giffer2).

# About auto-grading

## How it works

If the "Check the result" box is checked, giffer will automatically grade the student's code based on a sample hosted on the server. Note that this feature **does not** simply compare the code. Instead, the student's FrameManager (which is responsible for storing data about the states of pins in every frame) is compared to the correct version.

## Making grading templates

To make a grading template, write some code and generate a gif. Make sure to have the correct exercise number filled in. Next, go to the "Dev Tools" tab and click "Export Exercise". Download the file and move it to "giffer-reborn/exercises/[exercise number]/Exercise_[exercise number].FrameManager" (you will probably have to create the exercise number directory). You should be good to go. Create some new code and run it with the "Check the result" box ticked and the correct exercise number filled in.

To test an exercise, cd to this directory and run `python -m SimpleHTTPServer`

# Updating the site (cache-busting)

Browsers cache the site's JS/CSS, so after changing anything in `js/` or `css/`, run

```bash
bash deploy/bump-version.sh
```

before committing. It stamps a new `?v=` version on every script and stylesheet in `index.html`
(the interpreter worker picks it up automatically), so students get the new code without a hard refresh.
