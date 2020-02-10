/**
 * A script that checks a given page for dead links, outputting them to the
 * console.
 */

const request = require('request');
const yargs = require('yargs');

// Regexes to match links and urls respectively. Ideally href should be composed
// from the url regex, but this gets kind of messy in JS because they would have
// to be treated as strings (and all the special characters escaped). I opted to
// leave them as is for the sake of readability.
const hrefRegex = /<[aA]{1} [^>]*href=["'](https?:\/\/[^"']*\.[^."']*)["']/g;
const urlRegex = /https?:\/\/[^"']*\.[^."']*/g;

// Parse the argument
const argv = yargs
.usage('Usage: $0 <command>')
.command('url', 'The URL of the page to be checked')
.demandCommand(1, 'You must specify the URL to check')
.help()
.alias('help', 'h')
.argv;

// The URL of the page to be checked
const url = argv._[0];

// The array that stores the list of dead links
var badLinks = [];

/**
 * Get the contents of the page at 'url' and pass it to parsePageData as a
 * string.
 */
const fetchPageData = () => {
    request(url, (error, response, body) =>   {
        if (error)  {
            console.log(error);
        }
        else if(response.statusCode == 200)	{
    		parsePageData(body);
    	}
    });
}

/**
 * Take the page body and pulls out the link tags, performing a health check on
 * the URLs of each, adding the ones that fail to 'badLinks'
 */
const parsePageData = (data) =>	{
    let links = data.match(hrefRegex);
    for(let link of links)  {
        // Pull out the raw url from the tag
        // (there should only be one if it's valid HTML)
        let url = link.match(urlRegex)[0];
        
        // Send a get request to the url and add it to badLinks
        // if it returns with an error or bad status code
        request(url, (error, response, body) =>   {
             if(error || response.statusCode != 200)   {
                 badLinks.push(url);
             }
        });
    }
}

/**
 * At the end of execution, once all the requests have come back, print the
 * contents of badLinks to the console.
 */
process.on('exit', (code) => {
    console.log(badLinks);
});

fetchPageData();