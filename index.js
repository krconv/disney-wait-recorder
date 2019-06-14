const themeparks = require('themeparks');
const influx = require('influx');

const parks = [
  new themeparks.Parks.WaltDisneyWorldMagicKingdom(),
  new themeparks.Parks.WaltDisneyWorldAnimalKingdom(),
  new themeparks.Parks.WaltDisneyWorldEpcot(),
  new themeparks.Parks.WaltDisneyWorldHollywoodStudios(),
];

const client = new influx.InfluxDB({
  database: 'db',
  host: 'INFLUX_HOST',
  port: 8086,
  username: 'INFLUX_USERNAME',
  password: 'INFLUX_PASSWORD'
});

function cleanParkName(parkName) {
  return parkName.split(' - ')[0];
}

function cleanRideName(rideName) {
  const phrasesToReplace = [
    [' - Temporarily Closed', ''], [' - NEW!', ''], [' - New', ''],
    ['•', ' ']
  ];

  var cleanRideName = rideName;
  phrasesToReplace.forEach(phrase => {
    cleanRideName = cleanRideName.replace(phrase[0], phrase[1]);
  });

  return cleanRideName;
}

function createPoint(parkName, rideName, waitTime) {
  return {
    measurement: 'disney/wait_time',
    tags: {'park': parkName, 'ride': rideName},
    fields: {value: waitTime}
  };
}

function writeToDatabase(points) {
  client.writePoints(points);
}

function recordWaitTimes() {
  console.log('Recording wait times...')
  parks.forEach(park => {
    const parkName = cleanParkName(park.Name);
    console.log(`Looking at ${parkName}`)

    park.GetWaitTimes().then(rides => {
      var points = []
      rides.forEach(ride => {
        if (ride.active) {
          const rideName = cleanRideName(ride.name);

          points.push(createPoint(parkName, rideName, ride.waitTime));
        }
      })
      console.log(`Writing ${points.length} points to the database`);
      writeToDatabase(points);
    })
  })
}

recordWaitTimes()
setInterval(recordWaitTimes, 5 * 60 * 1000)

