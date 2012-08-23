# CSS Style Count

## Background

This project is a simple experiment which allows to count the total number of CSS rules for a given web page.

This is built using javascript and the script should work cross-browser (I tested on Chrome, Firefox, IE8+, iPad).

The interesting bits are under `js/css-style-count.js`.

## How it works

The main function is called `getCssStyleCount`. It takes a callback as an argument. The callback will be called once the total count of CSS rules has been calculated. That total count is passed to the callback.

Example:
```
getCssStyleCount(function(count){
	alert('Found ' + count + ' CSS rules.');
});
```

Notes:

 - It only looks for style applied to the screen (it should be skipping media types such as `print`).
 - It executes asynchronously to work around eventual cross domain issues (see below).

# Compatibility & edge cases

IE8 and below populate the `media` property of a styleSheet object as a string. Recent browsers are populating `media` as an object which include a `mediaText` property. The script handles the two different behaviors.

Recent browsers do not allow to inspect CSS rules for a stylesheet loaded from a different domain (which is common practice these days). To work around this, the script will attempt to fetch the CSS file using AJAX via a proxy. For this use case, I've used [Ben Alman's Simple PHP Proxy](https://github.com/cowboy/php-simple-proxy). Note that I had to configure Apache to allow cross domain requests using the following in a `.htaccess` file:
```
<IfModule mod_headers.c>
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET"
Header set Access-Control-Allow-Headers "X-Requested-With"
</IfModule>
```

# Dependencies

The only required dependency is [Dustin Diaz's Reqwest](https://github.com/ded/reqwest) which is a simple AJAX abstraction layer.

# License

WTFPL