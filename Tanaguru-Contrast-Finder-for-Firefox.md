This is Tanaguru Contrast-Finder for Firefox

This addon speeds and eases the use of [Tanaguru Contrast-Finder](http://contrast-finder.tanaguru.com/) to find good colors for contrasts in web accessibility (a11y).

## Usage

Right-clic on a given part of text, select whether you want to improve the foreground or background color, and validate.

* If the contrast between text color (foreground) and the background is correct, you will have an informative message.
* On the other hand, if the contrast is not valid, you will be directed a "result page" of Contrast-Finder giving you choices of colors that create valid contrast options.

## How to build

1. `git clone git@github.com:Tanaguru/Contrast-Finder-Firefox.git`
1. Get [lastest Mozilla Addon SDK](https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/jetpack-sdk-latest.zip) 
1. from the SDK, run `bin/activate` (please, read the SDK's README that describes it all)
1. get into the directory of the source code, and run `cfx xpi`

## How to deploy

TODO