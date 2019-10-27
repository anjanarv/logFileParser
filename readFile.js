const eventStream = require("event-stream");
const fs = require("fs");
const ipregex = require("ip-regex");
const {
  map,
  flatten,
  countBy,
  uniq,
  slice,
  orderBy,
  reject,
  isEmpty
} = require("lodash");

let ipAddressList = [],
  urlPatternList = [];
let regexUrlPattern =
  "GET [-a-zA-Z0-9@:%_+.~#?&//=][-a-zA-Z]*.*HTTP[-a-zA-Z0-9@:%_+.~#?&//=[1-9]*[1-9]";

const readAndProcessFile = () => {
  fs.createReadStream("data/programming-task-example-data.log")
    .pipe(eventStream.split())
    .pipe(
      eventStream.mapSync(line => {
        findUniqueIPAddresses(line);
        findURLPatternMatch(line);
      })
    )
    .on("error", error => {
      console.log("Error in reading the file !!", error);
    })
    .on("end", () => {
      const writeStream = fs.createWriteStream("report.json"); // writing results to report
      writeStream.write(
        JSON.stringify({
          ...findMostVisitedAndUniqueIpAddress(ipAddressList),
          ...findMostVisitedAndUniqueURL(urlPatternList)
        })
      );
      writeStream.end();
      writeStream.on("error", error =>
        console.log("Error in writing the file !!", error)
      );
    });
};

//Find unique ip addresses in a line using ip-regex
const findUniqueIPAddresses = line => {
  ipAddressList.push(line.match(ipregex()));
};

//Find unique urls in a line using regex pattern
const findURLPatternMatch = line => {
  let matches = line.match(regexUrlPattern) || [];
  urlPatternList.push(matches);
};

//Find ip addresses most visited and unique ip addreses
const findMostVisitedAndUniqueIpAddress = ipAddressList => {
  return {
    uniqueIPAdresses: uniq(reject(flatten(ipAddressList), isEmpty)),
    mostVisitedIPAddress: extractMostVisited(ipAddressList, "ipAddress")
  };
};

//Find url patterns most visited and unique ip addreses
const findMostVisitedAndUniqueURL = urlPatternList => {
  return {
    uniqueURL: uniq(reject(flatten(urlPatternList), isEmpty)),
    mostVisitedURL: extractMostVisited(urlPatternList, "url")
  };
};

// generic  method to extract most visited for ip address and url lists
const extractMostVisited = (list, keyForList) => {
  const flattenedList = flatten(reject(list, isEmpty));
  const mappedValues = map(countBy(flattenedList), (count, key) => {
    return { [keyForList]: key, count: count };
  });
  const orderedMappedValues = orderBy(mappedValues, "count", "desc");

  return slice(orderedMappedValues, 0, 3);
};

module.exports = {
  readAndProcessFile,
  findMostVisitedAndUniqueIpAddress,
  findMostVisitedAndUniqueURL,
  extractMostVisited
};
