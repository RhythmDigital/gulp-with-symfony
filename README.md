Gulp with Symfony
=================

An opinionated (and untested) Symfony project boilerplate with Bootstrap installed and support for ES2015, Sass, and cache busting.

---

## First-time setup

### Prerequisites

1. [Git](https://git-scm.com/downloads)
1. [PHP](http://php.net/manual/en/install.php)
1. [Composer](https://getcomposer.org/)
1. [Node.js and npm](https://nodejs.org/en/download/)
1. [Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)

### Install

1. `git clone https://github.com/danielmorgan/gulp-with-symfony.git`
1. Set up an empty database.
1. `composer install` to install PHP dependencies and fill in your environment variables when prompted.
1. `php bin/console doctrine:schema:update --force` to run database migrations.
1. `npm install` to pull in frontend dependencies.
1. `gulp` to build all the frontend assets.

## Workflow

### Gulp

Gulp is a task-runner that can act as a replacement for file watchers, and also provide a mechanism for preparing code for production. 

`gulp`

Will build Sass and JS files down to `web/css/build.css` and `web/js/build.js` respectively.

`gulp --production`

Will do the same, but will minify the resulting files, remove sourcemaps and apply some [cache busting magic](#cache-busting).

`gulp watch`

Watches files in the resources directory (which can be configured by modifying `config.assetsDir` in `gulpfile.js`) and build them every time it detects a change.

### Bootstrap

Included in the `package.json` dependencies is [bootstrap-sass](https://www.npmjs.com/package/bootstrap-sass). In `src/AppBundle/Resources/styles/_bootstrap-custom.scss` is a list of imports that can grab discrete Sass components of the Bootstrap framework from `node_modules/` and include them in the final built CSS file. This cuts down on filesize by only importing parts of the framework that are being used.

To include a component all you have to do is uncomment the relevant `@import` statement and you're good to start using it within your own Sass files.

### JavaScript

`index.js` is defined as the entry point to your application. Anything you want to use within your own code _should_ be imported using [UMD compatible modules](http://dontkry.com/posts/code/browserify-and-the-universal-module-definition.html).

[Browserify](http://browserify.org/) will bundle all your code and your dependencies into one file. This is handled by Gulp in this particular setup so you don't need to run `browserify` manually.

#### Example

`npm install --save moment`

```js
// index.js

var Moment = require('moment');
Moment().endOf('day').fromNow(); // in 10 hours
```

Check out the [Browserify Handbook](https://github.com/substack/browserify-handbook) for more information on what Browserify can do.

#### Recommendations

Try to maintain a list of dependencies in `package.json` by searching for it on [npmjs.org](https://npmjs.org) and running `npm install --save packagename`. This will pull down the files needed into `node_modules/` and save it as a dependency.

If the library or framework you want to use is not available from `npm`, or otherwise in a format you can import, there are a couple of options:

1. Recommended: [browserify-shim](https://github.com/thlorenz/browserify-shim)
1. Alternatively save it somewhere like `scripts/vendor/`, load it in the template files, and then make it available on the `window` object. Make sure this is loaded before `js/build.js` so that the required objects are available to your application code.

### Cache Busting

When you run `gulp --production` it will build the CSS and JS with unique filenames so that you can avoid user's browsers caching them and not seeing the latest changes.

A manifest file is created which maps the original filename `css/build.css` to the versioned filename `css/build-f5e6ac2c14.css`. This is stored in `app/Resources/assets/rev-manifest.json`.

The custom Twig filter `rev` (Class: `AppBundle\AssetRevisionExtension`) reads this manifest file and inserts the versioned filename into the template. If the manifest or versioned files don't exist, the original filename is used.

The filter is registered as a service in `app/config/services.yml` and can be used like so:

```html
<link rel="stylesheet" href="{{ asset('css/build.css'|rev) }}">
<script type="text/javascript" src="{{ asset('js/build.js'|rev) }}"></script>
```
