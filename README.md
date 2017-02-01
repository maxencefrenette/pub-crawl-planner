# Pub Crawl Planner
A route generator for multi-team pub crawls with built-in conflict avoidance.

Created during the [McHacks 2017 hackathon](https://mchacks.io/index.html).

## How does it work?
The user provides multiple pub locations, a start time, a end time and a number of crawl teams. The software will generate a schedule for each team of when to enter and leave each pub. It will find the best possible path and prevent any conflict (there will be never more than 3 teams at the same pub).
The output is a pdf file where each page is the schedule for a specific team. This way, the organizer can simply print the document and give one page to each team leader.

## Try it
Visit http://berseker59.github.io/pub-crawl-planner/.
### Locally
You can run it locally since it is a client-side only app. Just open the index.html file in your browser. However, Google Chrome has some security limitations that prevents the generation of the PDF file locally. To go around it you have to deactivate this security feature (instructions on this page: http://www.chrome-allow-file-access-from-file.com/linux.html).
