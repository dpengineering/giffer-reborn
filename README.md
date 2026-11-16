# giffer-reborn

A completely rewritten version of the DPEA giffer tool by pcgrosen, original [here](https://github.com/ckaufer/giffer2).

# About auto-grading

## How it works

If the "Check the result" box is checked, giffer will automatically grade the student's code based on a sample hosted on the server. Note that this feature **does not** simply compare the code. Instead, the student's FrameManager (which is responsible for storing data about the states of pins in every frame) is compared to the correct version.

## Making grading templates

Use the build script (needs Node). Put the exercise's files in `exercises/<N>/`:

- `Exercise<N>.html`: the directions (shown in Tips & Tricks)
- `Exercise<N>/Exercise<N>.ino`: the answer key

then run

```bash
node tools/build-exercise.js <N>          # writes exercises/<N>/Exercise_<N>.FrameManager
node tools/build-exercise.js <N> --show   # also prints the starting code students get
node tools/build-exercise.js <N> --check  # compare with the current file, write nothing
node tools/build-exercise.js --all        # check every exercise (never writes)
```

The script runs the answer key with the site's own interpreter, so there's no need to generate a gif and use Tools > Export Exercise.

### Starting code from the answer key

Mark the answer key and the script writes the starting code (with and without comments) for you:

```cpp
pinMode(2, OUTPUT); //@todo Set pin 2 as an OUTPUT      -> "//TODO: Set pin 2 as an OUTPUT"

//@hide Blink LED 2 for {{ON}}ms                         -> these lines become one TODO line
digitalWrite(2, HIGH);
delay({{ON}});
//@end

//@hide                                                  -> hidden with no TODO...
for(int count = 1; count <= 5; count++) { blink2(); }
//@show blink2(); // This is a function call             -> ...and students get this line instead
//@end
```

Without markers, `Exercise<N>_StartingPoint/Exercise<N>_StartingPoint.ino` is used as the starting code.

### Different timings for each student

Add `//@vary` lines to the answer key and use `{{NAME}}` in the answer key, starting code and directions (simple math works too, like `{{ON * 2}}`):

```cpp
//@vary ON = 100, 150, 200, 250, 300
//@vary PAUSE = 2000..4000 step 500
```

Each student gets values picked from their name and the exercise number, so a friend's code fails their grading. Students must type a name before an exercise will load. The script tries every combination and prints how often a table of 4 all get different versions. Exercise 31 is a worked example.

Other options (board type, input keyframes) go in an optional `exercises/<N>/exercise.json`; see the top of `tools/build-exercise.js`.

### The old way

Write some code and generate a gif with the exercise number filled in, then go to Tools > Export Exercise, download the file, and save it as `exercises/[exercise number]/Exercise_[exercise number].FrameManager`.

To test an exercise, cd to this directory and run `python3 -m http.server`

# Updating the site (cache-busting)

Browsers cache the site's JS/CSS, so after changing anything in `js/` or `css/`, run

```bash
bash deploy/bump-version.sh
```

before committing. It stamps a new `?v=` version on every script and stylesheet in `index.html`
(the interpreter worker picks it up automatically), so students get the new code without a hard refresh.
