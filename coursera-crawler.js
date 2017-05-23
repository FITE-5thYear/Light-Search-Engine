var unirest = require('unirest'),
    parse5 = require('parse5'),
    xpath = require('xpath'),
    xmlser = require('xmlserializer'),
    dom = require('xmldom').DOMParser,
    coursesMapURL = 'https://www.coursera.org/sitemap~www~courses.xml';

parseXMLMap();

module.exports.parseXMLMap = parseXMLMap;

var data = [], locations = [], i = 0;

function crawlCoursePage(courseUrl){

    if(i == locations.length){
        require('fs').writeFile('./coursera-data.json', JSON.stringify(data));
        return;
    }

    console.log("Getting " + courseUrl);

    unirest.get(courseUrl)
       .end(function(response){
            var document = parse5.parse(response.body);

            var xhtml = xmlser.serializeToString(document);

            var doc = new dom().parseFromString(xhtml);

            var select = xpath.useNamespaces({ 'x' : 'http://www.w3.org/1999/xhtml'});

            var courseTitle = select('//x:h1', doc)[0];

            //console.log(courseTitle.firstChild.data);

            var courseDescription = select("//x:p[contains(concat(' ', normalize-space(@class), ' '), ' course-description ')]", doc);

            //console.log(courseDescription[0].firstChild.nextSibling.nextSibling.data);
            var courseWeeks = select("//x:div[contains(concat(' ', normalize-space(@class), ' '), ' week ')]", doc);

            var weeksData = [];

            courseWeeks.forEach(function(week){
                var weekTitle = select("//x:div[@data-reactid='" + week.attributes.getNamedItem('data-reactid').nodeValue+ "' and contains(concat(' ', normalize-space(@class), ' '), ' week ')]//x:div[contains(concat(' ', normalize-space(@class), ' '), ' week-heading ')]", week)[0].firstChild.data,
                    weekName = select("//x:div[@data-reactid='" + week.attributes.getNamedItem('data-reactid').nodeValue+ "' and contains(concat(' ', normalize-space(@class), ' '), ' week ')]//x:div[contains(concat(' ', normalize-space(@class), ' '), ' module-name ')]", week)[0].firstChild.data,
                    weekDesc = select("//x:div[@data-reactid='" + week.attributes.getNamedItem('data-reactid').nodeValue+ "' and contains(concat(' ', normalize-space(@class), ' '), ' week ')]//x:div[contains(concat(' ', normalize-space(@class), ' '), ' module-desc ')]", week)[0].firstChild.firstChild.nextSibling.data;
                
                weeksData.push({
                    weekTitle : weekTitle,
                    weekName : weekName,
                    weekDesc : weekDesc
                });
            });

            data.push({
                courseTitle : courseTitle.firstChild.data,
                courseDescription : courseDescription[0].firstChild.nextSibling.nextSibling.data,
                weeks : weeksData
            });

            i++;

            crawlCoursePage(locations[i]);
       });
}

function parseXMLMap(){
    unirest.get(coursesMapURL)
           .end(function(response){
                var doc = new dom().parseFromString(response.body);

                var select = xpath.useNamespaces({ 'x' : 'http://www.sitemaps.org/schemas/sitemap/0.9'});

                var _locations = select('//x:loc', doc);

                locations = _locations.map(x => x.firstChild.data);


                locations = locations.slice(0, 100);
                crawlCoursePage(locations[0]);

                //locations.forEach(location => crawlCoursePage(location));
           });
}