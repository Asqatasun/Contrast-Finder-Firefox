This is Tanaguru Contrast-Finder for Firefox

This addon speeds and eases the use of [Tanaguru Contrast-Finder](http://contrast-finder.tanaguru.com/) to find good colors for contrasts in web accessibility (a11y).

## Usage

Right-clic on a given part of text, select whether you want to improve the foreground or background color, and validate.

* If the contrast between text color (foreground) and the background is correct, you will have an informative message.
* On the other hand, if the contrast is not valid, you will be directed a "result page" of Contrast-Finder giving you choices of colors that create valid contrast options.

## Screenshots

### Right-clic on a text and choose to improve background of foreground

![1) Enhance contrast for the green label (from Bootstrap) : right-clic on it and select whether to improve foreground of background.](https://raw.githubusercontent.com/Tanaguru/Contrast-Finder-Firefox/master/Screenshots/Tanaguru_Contrast-Finder_on_Bootstrap_green_label_1_right_clic.png)

### Choose the colour you like most

![
2) Valid colours (for contrast) are presented, just pick the one you like most !](https://raw.githubusercontent.com/Tanaguru/Contrast-Finder-Firefox/master/Screenshots/Tanaguru_Contrast-Finder_on_Bootstrap_green_label_2_result_page.png)

## How to build

1. `git clone git@github.com:Tanaguru/Contrast-Finder-Firefox.git`
1. Get [lastest Mozilla Addon SDK](https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/jetpack-sdk-latest.zip) 
1. from the SDK, run `bin/activate` (please, read the SDK's README that describes it all)
1. To test `cfx run`

## How to deploy

1. get into the directory of the source code, and run `cfx xpi`