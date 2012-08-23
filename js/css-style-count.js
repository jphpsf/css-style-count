/**
 * Bookmarklet code

javascript:(function(){
if (!window.getCssStyleCount) {
	var cssCount = document.createElement("script");
	cssCount.async = true;
	cssCount.src = "http://jphpsf.com/css-style-count/js/css-style-count.js";
	document.getElementsByTagName('script')[0].parentNode.insertBefore(cssCount,null);
	cssCount.onload=function(){window.getCssStyleCount(
		function(count){
			alert('Found ' + count + ' CSS rules.');
		}
	)};
} else {
	alert('Can not run twice!')
}
})();

  */

/**
 * This function will calculate the total number of styles for the current
 * document. The function takes a callback that will be called with the total
 * count of CSS rules once the stylesheets analysis is complete.
 */
getCssStyleCount = function(callback){

	// This is a helper function that will find cross domain stylesheets
	// and insert them as inline style into the current document.
	var getCrossDomainStylesheets = function(xdCallback){
		var url, xdUrl, xdCounter = 0,
			styles = document.styleSheets,
			count = styles.length;

		for (var i=0; i<count; i++) {
			// Skip media types that are not displayed on the screen
			if (isDisplayedMedia(styles[i])) {
				continue;
			}

			try {
	        	getRuleCount(styles[i]);
		    } catch (e) {

				// If we did not get an exception, we'll check for cross domain stylesheets
				// in the current document. Some browsers do not allow to inspect styles for
				// cross domain CSS files, so we'll fetch the file asynchronously and add it
				// inline in the document
				url = styles[i].href;
		    	if (url && /^http/.test(url) && url.split('/')[2] !== location.hostname) {

				    // Request cross domain CSS files via proxy (using Ben Alman's Simple Proxy)
				    // See project at http://benalman.com/projects/php-simple-proxy/
					xdCounter++;
				    xdUrl = encodeURIComponent(url.replace(/^https?:\/\//,''));
				    reqwest({
				    	url: 'http://proxy.jphpsf.com/css-proxy/?url='+xdUrl,
				    	type: 'json',
				    	success: function(resp){

				    		var style = document.createElement('style'),
				    			head = document.getElementsByTagName('head')[0];;
							style.textContent = resp.contents;
							head.appendChild(style);

							xdCounter--;
							if (xdCounter === 0 ) {
								xdCallback();
							}
				    	}
				    });
				}
			}
		}

		if (xdCounter === 0 ) {
			xdCallback();
		}
	};

	// Simple function to return the media type of a given stylesheets
	var isDisplayedMedia = function(styleSheet){
		var media = false;

		// Older IEs don't have a media object with the mediaText property,
		// but instead just a string
		if (typeof styleSheet.media === 'string') {
			media = styleSheet.media;
		} else {
			media = styleSheet.media.mediaText;
		}

		return (media && media !== 'all' && media !== 'screen');
	};

	// Simple function to return the count of CSS rules in a given stylesheets
	var getRuleCount = function(styleSheet){
		// cssRules is from W3C spec and rules is specific to IE
		var rules = (styleSheet.cssRules ? styleSheet.cssRules : styleSheet.rules);
		if (rules) {
			return rules.length;
		} else {
			throw "No rules found"
		}
	};

	// Main code path: we first try to find cross-domain stylesheets
	// then, in the callback we calculate the total count of CSS rules
	getCrossDomainStylesheets(function(){
		var media, totalRuleCount = 0,
			styles = document.styleSheets,
			count = styles.length;

		for (var i=0; i<count; i++) {
			// Skip media types that are not displayed on the screen
			if (isDisplayedMedia(styles[i])) {
				continue;
			}

			try {
	        	totalRuleCount += getRuleCount(styles[i]);
		    } catch (e) {}
		}

		callback(totalRuleCount);
	})
}

/**
 * Below are a couple of utility libraries as well as the test runner
 */

/*!
  * domready (c) Dustin Diaz 2012 - License MIT - https://github.com/ded/domready
  */
!function(a,b){typeof module!="undefined"?module.exports=b():typeof define=="function"&&typeof define.amd=="object"?define(b):this[a]=b()}("domready",function(a){function m(a){l=1;while(a=b.shift())a()}var b=[],c,d=!1,e=document,f=e.documentElement,g=f.doScroll,h="DOMContentLoaded",i="addEventListener",j="onreadystatechange",k="readyState",l=/^loade|c/.test(e[k]);return e[i]&&e[i](h,c=function(){e.removeEventListener(h,c,d),m()},d),g&&e.attachEvent(j,c=function(){/^c/.test(e[k])&&(e.detachEvent(j,c),m())}),a=g?function(c){self!=top?l?c():b.push(c):function(){try{f.doScroll("left")}catch(b){return setTimeout(function(){a(c)},50)}c()}()}:function(a){l?a():b.push(a)}})

/*!
  * Reqwest! (c) Dustin Diaz 2011 - License MIT - https://github.com/ded/domready
  */
!function(a,b){typeof module!="undefined"?module.exports=b():typeof define=="function"&&define.amd?define(a,b):this[a]=b()}("reqwest",function(){function handleReadyState(a,b,c){return function(){a&&a[readyState]==4&&(twoHundo.test(a.status)?b(a):c(a))}}function setHeaders(a,b){var c=b.headers||{},d;c.Accept=c.Accept||defaultHeaders.accept[b.type]||defaultHeaders.accept["*"],!b.crossOrigin&&!c[requestedWith]&&(c[requestedWith]=defaultHeaders.requestedWith),c[contentType]||(c[contentType]=b.contentType||defaultHeaders.contentType);for(d in c)c.hasOwnProperty(d)&&a.setRequestHeader(d,c[d])}function generalCallback(a){lastValue=a}function urlappend(a,b){return a+(/\?/.test(a)?"&":"?")+b}function handleJsonp(a,b,c,d){var e=uniqid++,f=a.jsonpCallback||"callback",g=a.jsonpCallbackName||"reqwest_"+e,h=new RegExp("((^|\\?|&)"+f+")=([^&]+)"),i=d.match(h),j=doc.createElement("script"),k=0;i?i[3]==="?"?d=d.replace(h,"$1="+g):g=i[3]:d=urlappend(d,f+"="+g),win[g]=generalCallback,j.type="text/javascript",j.src=d,j.async=!0,typeof j.onreadystatechange!="undefined"&&(j.event="onclick",j.htmlFor=j.id="_reqwest_"+e),j.onload=j.onreadystatechange=function(){if(j[readyState]&&j[readyState]!=="complete"&&j[readyState]!=="loaded"||k)return!1;j.onload=j.onreadystatechange=null,j.onclick&&j.onclick(),a.success&&a.success(lastValue),lastValue=undefined,head.removeChild(j),k=1},head.appendChild(j)}function getRequest(a,b,c){var d=(a.method||"GET").toUpperCase(),e=typeof a=="string"?a:a.url,f=a.processData!==!1&&a.data&&typeof a.data!="string"?reqwest.toQueryString(a.data):a.data||null,g;return(a.type=="jsonp"||d=="GET")&&f&&(e=urlappend(e,f),f=null),a.type=="jsonp"?handleJsonp(a,b,c,e):(g=xhr(),g.open(d,e,!0),setHeaders(g,a),g.onreadystatechange=handleReadyState(g,b,c),a.before&&a.before(g),g.send(f),g)}function Reqwest(a,b){this.o=a,this.fn=b,init.apply(this,arguments)}function setType(a){var b=a.match(/\.(json|jsonp|html|xml)(\?|$)/);return b?b[1]:"js"}function init(o,fn){function complete(a){o.timeout&&clearTimeout(self.timeout),self.timeout=null,o.complete&&o.complete(a)}function success(resp){var r=resp.responseText;if(r)switch(type){case"json":try{resp=win.JSON?win.JSON.parse(r):eval("("+r+")")}catch(err){return error(resp,"Could not parse JSON in response",err)}break;case"js":resp=eval(r);break;case"html":resp=r}fn(resp),o.success&&o.success(resp),complete(resp)}function error(a,b,c){o.error&&o.error(a,b,c),complete(a)}this.url=typeof o=="string"?o:o.url,this.timeout=null;var type=o.type||setType(this.url),self=this;fn=fn||function(){},o.timeout&&(this.timeout=setTimeout(function(){self.abort()},o.timeout)),this.request=getRequest(o,success,error)}function reqwest(a,b){return new Reqwest(a,b)}function normalize(a){return a?a.replace(/\r?\n/g,"\r\n"):""}function serial(a,b){var c=a.name,d=a.tagName.toLowerCase(),e=function(a){a&&!a.disabled&&b(c,normalize(a.attributes.value&&a.attributes.value.specified?a.value:a.text))};if(a.disabled||!c)return;switch(d){case"input":if(!/reset|button|image|file/i.test(a.type)){var f=/checkbox/i.test(a.type),g=/radio/i.test(a.type),h=a.value;(!f&&!g||a.checked)&&b(c,normalize(f&&h===""?"on":h))}break;case"textarea":b(c,normalize(a.value));break;case"select":if(a.type.toLowerCase()==="select-one")e(a.selectedIndex>=0?a.options[a.selectedIndex]:null);else for(var i=0;a.length&&i<a.length;i++)a.options[i].selected&&e(a.options[i])}}function eachFormElement(){var a=this,b,c,d,e=function(b,c){for(var e=0;e<c.length;e++){var f=b[byTag](c[e]);for(d=0;d<f.length;d++)serial(f[d],a)}};for(c=0;c<arguments.length;c++)b=arguments[c],/input|select|textarea/i.test(b.tagName)&&serial(b,a),e(b,["input","select","textarea"])}function serializeQueryString(){return reqwest.toQueryString(reqwest.serializeArray.apply(null,arguments))}function serializeHash(){var a={};return eachFormElement.apply(function(b,c){b in a?(a[b]&&!isArray(a[b])&&(a[b]=[a[b]]),a[b].push(c)):a[b]=c},arguments),a}var win=window,doc=document,twoHundo=/^20\d$/,byTag="getElementsByTagName",readyState="readyState",contentType="Content-Type",requestedWith="X-Requested-With",head=doc[byTag]("head")[0],uniqid=0,lastValue,xmlHttpRequest="XMLHttpRequest",isArray=typeof Array.isArray=="function"?Array.isArray:function(a){return a instanceof Array},defaultHeaders={contentType:"application/x-www-form-urlencoded",accept:{"*":"text/javascript, text/html, application/xml, text/xml, */*",xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript",js:"application/javascript, text/javascript"},requestedWith:xmlHttpRequest},xhr=win[xmlHttpRequest]?function(){return new XMLHttpRequest}:function(){return new ActiveXObject("Microsoft.XMLHTTP")};return Reqwest.prototype={abort:function(){this.request.abort()},retry:function(){init.call(this,this.o,this.fn)}},reqwest.serializeArray=function(){var a=[];return eachFormElement.apply(function(b,c){a.push({name:b,value:c})},arguments),a},reqwest.serialize=function(){if(arguments.length===0)return"";var a,b,c=Array.prototype.slice.call(arguments,0);return a=c.pop(),a&&a.nodeType&&c.push(a)&&(a=null),a&&(a=a.type),a=="map"?b=serializeHash:a=="array"?b=reqwest.serializeArray:b=serializeQueryString,b.apply(null,c)},reqwest.toQueryString=function(a){var b="",c,d=encodeURIComponent,e=function(a,c){b+=d(a)+"="+d(c)+"&"};if(isArray(a))for(c=0;a&&c<a.length;c++)e(a[c].name,a[c].value);else for(var f in a){if(!Object.hasOwnProperty.call(a,f))continue;var g=a[f];if(isArray(g))for(c=0;c<g.length;c++)e(f,g[c]);else e(f,a[f])}return b.replace(/&$/,"").replace(/%20/g,"+")},reqwest.compat=function(a,b){return a&&(a.type&&(a.method=a.type)&&delete a.type,a.dataType&&(a.type=a.dataType),a.jsonpCallback&&(a.jsonpCallbackName=a.jsonpCallback)&&delete a.jsonpCallback,a.jsonp&&(a.jsonpCallback=a.jsonp)),new Reqwest(a,b)},reqwest})

/*!
  * using domready to kick off the test
  */
domready(function(){
	getCssStyleCount(function(count){
		var test = document.getElementById('test'),
			body = document.getElementsByTagName('body')[0];

		// Very simple outcome: we are expecting 9 style rules
		if (count===9) {
			body.className = "pass";
			test.innerHTML = "PASS: Found " + count + " styles as expected.";
		} else {
			body.className = "fail";
			test.innerHTML = "FAIL: Found " + count + " styles but was expecting 9.";
		}
	});
})
