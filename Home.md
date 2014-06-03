This is Tanaguru Contrast-Finder for Firefox
https://addons.mozilla.org/fr/firefox/addon/tanaguru-contrast-finder/

This addon speeds and eases the use of [Tanaguru Contrast-Finder](http://contrast-finder.tanaguru.com/) to find good color contrast by selecting **directly in the web page** the element whom color you want to change.

This helps you in satisfying web accessibility (a11y) tests on contrasts:

* [WCAG Success Criteria 1.4.3](http://www.w3.org/TR/WCAG20/#visual-audio-contrast-contrast)
* [AccessiWeb criteria 3.3](http://www.accessiweb.org/index.php/accessiweb-22-english-version.html#crit-3-3)
* [RGAA test 2.5 (in french)](http://rgaa.net/Valeur-du-rapport-de-contraste-du.html)

## Usage and screenshots

see [Usage & screenshots](Usage and screenshots)

## How to build

1. `git clone git@github.com:Tanaguru/Contrast-Finder-Firefox.git`
1. Get [lastest Mozilla Addon SDK](https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/jetpack-sdk-latest.zip) 
1. from the SDK, run `bin/activate` (please, read the SDK's README that describes it all)
1. To test `cfx run`

## How to deploy

1. get into the directory of the source code, and run `cfx xpi`