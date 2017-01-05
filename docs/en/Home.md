This is **Contrast-Finder** for **Firefox**
> @@@TODO add URL of addons.mozilla.org

This **addon** speeds and eases the use of [Contrast-Finder](https://app.contrast-finder.org) 
to find good **color contrast** by selecting **directly in the web page** 
the element whom color you want to change. 

This helps you in satisfying **web accessibility** (a11y) tests on contrasts:

* [WCAG Success Criteria 1.4.3](http://www.w3.org/TR/WCAG20/#visual-audio-contrast-contrast)
* [WCAG Success Criteria 1.4.6](http://www.w3.org/TR/WCAG20/#visual-audio-contrast7)
* [RGAA test 3.3 (in french)](http://references.modernisation.gouv.fr/rgaa-accessibilite/criteres.html#crit-3-3)
* [RGAA test 3.4 (in french)](http://references.modernisation.gouv.fr/rgaa-accessibilite/criteres.html#crit-3-4)
* [AccessiWeb criteria 3.3](http://www.accessiweb.org/index.php/accessiweb-22-english-version.html#crit-3-3)



## Usage and screenshots

see [Usage & screenshots](Usage-and-screenshots.md)

## How to build

1. `git clone git@github.com:Asqatasun/Contrast-Finder-Firefox`
1. Get [lastest Mozilla Addon SDK](https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/jetpack-sdk-latest.zip) 
1. from the SDK, run `bin/activate` (please, read the SDK's README that describes it all)
1. To test `cfx run`

## How to deploy

1. get into the directory of the source code, and run `cfx xpi`

## How to contribute

See the [technical documentation](Technical-documentation.md)