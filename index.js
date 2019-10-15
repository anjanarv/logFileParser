const es = require("event-stream");
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
    .pipe(es.split())
    .pipe(
      es.mapSync(line => {
        findUniqueIPAddresses(line);
        findURLPatternMatch(line);
      })
    )
    .on("error", error => {
      console.log("Error in reading the file !!", error);
    })
    .on("end", () => {
      const writeStream = fs.createWriteStream("report.json");
      writeStream.write(
        JSON.stringify({
          ...findMostVisitedIpAddress(ipAddressList),
          ...findMostVisitedURL(urlPatternList)
        })
      );
      writeStream.end();
      writeStream.on("error", error =>
        console.log("Error in writing the file !!", error)
      );
    });
};

const findUniqueIPAddresses = line => {
  ipAddressList.push(line.match(ipregex({ exact: true })));
};

const findURLPatternMatch = line => {
  let matches = (line.match(regexUrlPattern) || []).map(e =>
    e.replace(regexUrlPattern, "$1")
  );
  urlPatternList.push(matches);
};

const findMostVisitedIpAddress = ipAddressList => {
  return {
    uniqueIPAdresses: uniq(reject(flatten(ipAddressList), isEmpty)),
    mostVisitedIPAddress: extractMostVisited(ipAddressList, "ipAddress")
  };
};

const findMostVisitedURL = urlPatternList => {
  return {
    uniqueURL: uniq(reject(flatten(urlPatternList), isEmpty)),
    mostVisitedURL: extractMostVisited(urlPatternList, "url")
  };
};

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
  findMostVisitedIpAddress,
  findMostVisitedURL,
  extractMostVisited
};
